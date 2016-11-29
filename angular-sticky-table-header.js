/*global angular, Event*/
(function () {
    
    'use strict';
    
    var module = angular.module('angular-sticky-table-header', []);
    
    module.directive('ngStickyHeader', ['$interval', function ($interval) {

        function createOuterDiv() {
            var
                div = document.createElement('div'),
                style = div.style;

            style.position = 'relative';

            return div;
        }

        function createInnerDiv() {
            var
                div = document.createElement('div'),
                style = div.style;

            style.position = 'absolute';
            style.left = '0px';
            style.right = '0px';

            return div;
        }

        function wrapTableInDivs(table) {
            var
                parent = table.parentElement,
                nextSibling = table.nextElementSibling;
            
            parent.removeChild(table);

            table.innerWrapper = createInnerDiv();
            table.outerWrapper = createOuterDiv();
            table.outerWrapper.appendChild(table.innerWrapper);
            table.innerWrapper.appendChild(table);
            
            if (nextSibling !== null) {
                nextSibling.parentElement.insertBefore(table.outerWrapper, nextSibling);
            } else {
                parent.appendChild(table.outerWrapper);
            }
            
        }
        
        function hideTableHeader(table) {
            table.querySelector('thead').style.visibility = 'hidden';
        }
        
        function isBody(element) {
            return element.tagName === 'BODY';
        }
        
        function isTransparent(element) {
            return ['', 'transparent', 'inherit'].indexOf(element.style.backgroundColor) !== -1;
        }
        
        function getOpaqueColor(element) {
            
            if (isBody(element)) {
                if (isTransparent(element)) {
                    return "white";
                } else {
                    return element.style.backgroundColor;
                }
            }
            
            if (isTransparent(element)) {
                return getOpaqueColor(element.parentElement);
            } else {
                return element.style.backgroundColor;
            }
        }
        
        function makeOpaque(element) {
            element.style.backgroundColor = getOpaqueColor(element);
            element.style.opacity = 1.0;
        }
        
        function setZOrder(behind, over) {
            over.style.zIndex = (behind.style.zIndex || 0) + 1;
        }
        
        function createHeaderOverlay(table) {
            var
                overlayTable = table.cloneNode(false),
                overlayHeader = table.querySelector('thead').cloneNode(true);
            
            overlayTable.appendChild(overlayHeader);
            table.innerWrapper.appendChild(overlayTable);
            table.overlayTable = overlayTable;
            hideTableHeader(table);
            makeOpaque(overlayTable);
            setZOrder(table, overlayTable);
        }
        
        function makeSameSize(src, dest) {
            var destWidth = src.offsetWidth + 'px';
            dest.style.width = destWidth;
            dest.style.minWidth = destWidth;
        }
        
        function makeSameSizeEventHandler(src, dest) {
            return function (event) {
                makeSameSize(src, dest);
            };
        }

        function setupResizeEventForColumn(srcTh, destTh) {
            window.addEventListener('resize', makeSameSizeEventHandler(srcTh, destTh));
        }
        
        
        function setupResizeEventsForHeaderAndColumns(table) {
            var
                i,
                srcHeaders = table.querySelectorAll('th'),
                destHeaders = table.overlayTable.querySelectorAll('th');
                        
            for (i = 0; i < srcHeaders.length; i += 1) {
                setupResizeEventForColumn(srcHeaders[i], destHeaders[i]);
            }
            
            window.addEventListener(
                'resize',
                makeSameSizeEventHandler(table.innerWrapper, table.overlayTable)
            );
            
        }
        
        function makeOverlayTableSticky(table, tableParent) {
            
            function stickToTop(style, pos) {
                style.position = 'fixed';
                style.top = '0px';
                style.left = pos.left + 'px';
                style.width = pos.width + 'px';
            }
            
            function stickToBottom(style, pos) {
                style.position = 'absolute';
                style.top = '';
                style.bottom = '0px';
                style.left = '0px';
                style.width = '100%';
            }
            
            function unstick(style) {
                style.position = 'absolute';
                style.top = '0px';
                style.left = '0px';
                style.width = '100%';
            }
            
            function onWindowScroll(event) {
                var
                    parentPos = tableParent.getBoundingClientRect(),
                    wrapperPos = tableParent.parentElement.getBoundingClientRect(),
                    overlayPos = table.getBoundingClientRect(),
                    isStickToTopOrBottom = parentPos.top <= 0,
                    isStickToBottom = wrapperPos.bottom < overlayPos.height;
                
                if (isStickToTopOrBottom) {
                    if (isStickToBottom) {
                        stickToBottom(table.style, wrapperPos);
                    } else {
                        stickToTop(table.style, parentPos);
                    }
                } else {
                    unstick(table.style);
                }
            }
            
            function onTouchStart(event) {
                table.fakeScrollInterval = $interval(onWindowScroll, 20);
            }
            
            function onTouchStop(event) {
                $interval.cancel(table.fakeScrollInterval);
            }
            
            window.addEventListener('scroll', onWindowScroll);
            document.addEventListener('touchstart', onTouchStart);
            document.addEventListener('touchend', onTouchStop);
            document.addEventListener('touchcancel', onTouchStop);
            onWindowScroll();
        }
        
        function fireResizeEvent() {
            window.dispatchEvent(new Event('resize'));
        }
                
        return {
            
            link: function (scope, element, attrs) {
                
                var
                    table = element[0],
                    update = attrs.ngStickyHeaderUpdate;

                function setWrapperHeight() {
                    table.outerWrapper.style.height = table.offsetHeight + 'px';
                }
                
                function resizeLater(value) {
                    if (angular.isDefined(value)) {
                        scope.$evalAsync(fireResizeEvent);
                    }
                }

                if (table.tagName === 'TABLE') {
                    wrapTableInDivs(table);
                    createHeaderOverlay(table);
                    setupResizeEventsForHeaderAndColumns(table);
                    makeOverlayTableSticky(table.overlayTable, table.innerWrapper);
                    
                    if (attrs.ngStickyHeaderUpdate) {
                        scope.$watchCollection(update, resizeLater);
                        scope.$watchCollection(update, function (value) {
                            
                            if (angular.isDefined(value)) {

                                [].forEach.call(table.querySelectorAll('img'), function (image) {
                                    image.addEventListener('load', function (event) {
                                        if (event.target.complete) {
                                            setWrapperHeight();
                                        }
                                    });
                                });
                                
                                setWrapperHeight();
                            }
                        });
                    }
                                                            
                    setWrapperHeight();
                    resizeLater({});
                    $interval(function () { setWrapperHeight(); }, 1000);
                    
                } else {
                    throw "ng-sticky-header attribute can only be used on <table>";
                }
            }
        };
    }]);
}());