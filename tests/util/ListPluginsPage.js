var Page = {

  clickAddButton: () => {
    return element(by.css('#newPlugin')).click();
  },

  /**
   * Returns a promise which will resolve with the rows displayed in the "list plugins" page
   */
  getRows: () => {
    return element.all(by.repeater('plugin in plugins'));
  },

  /**
   * Returns a promise which will resolve with the row at the position <index>
   */
  getRow: function(index) {
    return this.getRows().get(index);
  },

  /**
   * Returns a promise which will resolve with the cell at the position columnIndex for the row
   * whose index is <rowIndex>
   */
  getCell: function(rowIndex, columnIndex) {
    return this.getRow(rowIndex).all(by.css('td')).get(columnIndex);
  },

  /**
   * Returns a promise which will resolve with edit button being clicked for the row whose index is
   * <rowIndex>
   */
  clickEdit: function(rowIndex) {
    return this.getRow(rowIndex).element(by.cssContainingText('td a', 'mode_edit')).click();
  },

  /**
   * Returns a promise which will resolve with delete button being clicked for the row whose index is
   * <rowIndex>
   */
  clickDelete: function(rowIndex) {
    return this.getRow(rowIndex).element(by.cssContainingText('td a', 'delete')).click();
  },

  /**
   * Returns a promise which will resolve with the "no" button being clicked in the delete modal.
   */
  abortDeletion: () => {
    return element(by.cssContainingText('.modal a', 'Noooooo!')).click().then((response) => {
      return new Promise((resolve, reject) => {
        // takes a while for the modal to fade out.
        setTimeout(function() {
          resolve(response);
        }, 300);
      });
    });
  },

  /**
   * Returns a promise which will resolve with the "yes" button being clicked in the delete modal.
   */
  confirmDeletion: () => {
    return element(by.cssContainingText('.modal a', 'Yes')).click().then((response) => {
      return new Promise((resolve, reject) => {
        // takes a while for the modal to fade out.
        setTimeout(function() {
          resolve(response);
        }, 300);
      });
    });
  }
};

module.exports = Page;
