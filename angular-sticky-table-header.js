/*global angular, Event*/
(function () {
    
    'use strict';
    
    var module = angular.module('angular-sticky-table-header', []);
    
    module.directive('ngStickyHeader', [function () {

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
            
            var parent = table.parentElement;
            parent.removeChild(table);

            table.innerWrapper = createInnerDiv();
            table.outerWrapper = createOuterDiv();
            table.outerWrapper.appendChild(table.innerWrapper);
            table.innerWrapper.appendChild(table);
            parent.appendChild(table.outerWrapper);
        }
        
        function hideTableHeader(table) {
            table.querySelector('thead').style.visibility = 'hidden';
        }
        
        function makeOpaque(table) {
            table.style.backgroundColor = 'white';
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
            
            function stick(style, pos) {
                style.position = 'fixed';
                style.top = '0px';
                style.left = pos.left + 'px';
                style.width = pos.width + 'px';
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
                    isFixed = parentPos.top <= 0;
                
                if (isFixed) {
                    stick(table.style, parentPos);
                } else {
                    unstick(table.style);
                }
            }
            
            window.addEventListener('scroll', onWindowScroll);
            onWindowScroll();
        }
        
        function fireResizeEvent() {
            window.dispatchEvent(new Event('resize'));
        }
                
        return {
            
            link: function (scope, element, attrs) {
                
                var table = element[0];
                
                function resizeLater() {
                    scope.$evalAsync(fireResizeEvent);
                }

                if (table.tagName === 'TABLE') {
                    wrapTableInDivs(table);
                    createHeaderOverlay(table);
                    setupResizeEventsForHeaderAndColumns(table);
                    makeOverlayTableSticky(table.overlayTable, table.innerWrapper);
                    
                    if (attrs['ngStickyHeaderUpdate']) {
                        var update = attrs['ngStickyHeaderUpdate'];
                        scope.$watchCollection(update, resizeLater);
                    }
                    
                    resizeLater();
                    
                } else {
                    throw "ng-sticky-header attribute can only be used on <table>";
                }
                
            }
        };
        
    }]);
    
    
}());