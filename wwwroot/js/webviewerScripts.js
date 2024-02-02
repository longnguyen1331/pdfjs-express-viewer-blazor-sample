window.webviewerFunctions = {
    initWebViewer: function () {
        const viewerElement = document.getElementById('viewer');



        const domElements = {};
        const elementWidth = 100;
        const elementHeight = 25;

        WebViewer({
            path: 'lib',
            initialDoc: '../files/demo.pdf',
            licenseKey: 'VMeLR5MsW5lX3X9YfqQF',
        }, viewerElement).then((instance) => {
            // now you can access APIs through the WebViewer instance
            const { Core, UI } = instance;
            const { documentViewer } = instance.Core;


            Core.documentViewer.on('pageComplete', pageNumber => {
                if (domElements[pageNumber]) {
                    const zoom = documentViewer.getZoomLevel();
                    const pageContainer = document.getElementById('pageContainer' + pageNumber);
                    // add back and scale elements for the rerendered page
                    domElements[pageNumber].forEach(elementData => {
                        elementData.element.style.left = elementData.left * zoom;
                        elementData.element.style.top = elementData.top * zoom;
                        elementData.element.style.width = elementWidth * zoom;
                        elementData.element.style.height = elementHeight * zoom;
                        pageContainer.appendChild(elementData.element);
                    });
                }
            });

            // adding an event listener for when a document is loaded
            Core.documentViewer.addEventListener('documentLoaded', () => {
                console.log('document loaded');

                const doc = documentViewer.getDocument();
                // top left corner in viewer coordinates
                const x = 0;
                const y = 0;
                const pageNumber = 1;

                const pdfCoords = doc.getPDFCoordinates(pageNumber, x, y);
                // top left corner has a high y value in PDF coordinates
                // example return value { x: 0, y: 792 }

                // convert back to viewer coordinates
                const viewerCoords = doc.getViewerCoordinates(pageNumber, pdfCoords.x, pdfCoords.y);
            });

            // adding an event listener for when the page number has changed
            Core.documentViewer.addEventListener('pageNumberUpdated', (pageNumber) => {
                console.log(`Page number is: ${pageNumber}`);
            });

            documentViewer.on('click', e => {
                // refer to getMouseLocation implementation above
                const windowCoordinates = getMouseLocation(e);

                const displayMode = documentViewer.getDisplayModeManager().getDisplayMode();
                const page = displayMode.getSelectedPages(windowCoordinates, windowCoordinates);
                const clickedPage = (page.first !== null) ? page.first : documentViewer.getCurrentPage() - 1;

                const pageCoordinates = displayMode.windowToPage(windowCoordinates, clickedPage);

                const zoom = documentViewer.getZoomLevel();

                const customElement = document.createElement('div');
                customElement.style.position = 'absolute';
                customElement.style.left = pageCoordinates.x * zoom;
                customElement.style.top = pageCoordinates.y * zoom;
                customElement.style.width = 100 * zoom;
                customElement.style.height = 25 * zoom;
                customElement.style.backgroundColor = 'blue';
                customElement.style.zIndex = 35;



                const pageContainer = document.getElementById('pageContainer' + clickedPage);

                console.log({
                    element: customElement,
                    left: pageCoordinates.x,
                    top: pageCoordinates.y
                }, clickedPage, page)

                //pageContainer.appendChild(customElement);

                //if (!domElements[clickedPage]) {
                //    domElements[clickedPage] = [];
                //}

                //// save left and top so we can scale them when the zoom changes
                //domElements[clickedPage].push({
                //    element: customElement,
                //    left: pageCoordinates.x,
                //    top: pageCoordinates.y
                //});
            });

            const getMouseLocation = e => {
                const scrollElement = documentViewer.getScrollViewElement();

                const scrollLeft = scrollElement.scrollLeft || 0;
                const scrollTop = scrollElement.scrollTop || 0;

                return {
                    x: e.pageX + scrollLeft,
                    y: e.pageY + scrollTop
                };
            };

            // adds a button to the header that on click sets the page to the next page
            UI.setHeaderItems(header => {
                header.push({
                    type: 'actionButton',
                    img: 'https://icons.getbootstrap.com/assets/icons/caret-right-fill.svg',
                    onClick: () => {
                        const currentPage = Core.documentViewer.getCurrentPage();
                        const totalPages = Core.documentViewer.getPageCount();
                        const atLastPage = currentPage === totalPages;

                        if (atLastPage) {
                            Core.documentViewer.setCurrentPage(1);
                        } else {
                            Core.documentViewer.setCurrentPage(currentPage + 1);
                        }
                    }
                });
            });
        })
    }
};
