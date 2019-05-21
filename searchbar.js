jQuery(function ($) {
    "use strict";

    $.widget("ui.searchbar", {
        // Default options
        options: {
            filters_container: '',  // must be specified
            filters_link: '',  // must be specified
            filter_template: '<span data-for="{{ id }}" title="{{ title }}"><x></x> {{ name }}: {{ value }}</span>',
            filter_selector: 'span', // css selector for filter item (root node in filter_template)
            close_selector: 'x' // css selector for "x" button in each filter (from filter_template)
        },

        _create: function () {
            this.filters_container = $(this.options.filters_container);

            this._markup();
            this._filtersHandler();
            this._tagFilters(this.filters_container, this.element.find('filters'));
        },

        _markup: function() {
            var filters = '<filters></filters>';

            var el = this.element,
                input = el.find('input').detach(),
                html = '<table><tr><td class="input"></td><td class="filters">' + filters + '</td></tr></table>';

            // Get rid of "hidden" class
            this.filters_container.hide().removeClass('hidden').addClass('searchbar_filters');

            el.addClass('searchbar').html(html);
            el.find('.input').append(input);
        },

        /**
         * Handle events of filters box
         * @private
         */
        _filtersHandler: function () {
            var self = this,
                filters = this.filters_container,
                filters_list = this.element.find('filters'),
                filters_link = $(this.options.filters_link);

            // Handle clicks on "Advanced" link
            filters_link.click(function(e) {
                self._changeFiltersPopupState("toggle");
                e.preventDefault();
                return false
            });

            filters.on("keyup change", "input, select", function() {
                self._tagFilters(filters, filters_list);
            });

            // Handle clicks on "x"
            filters_list.on("click", self.options.close_selector, function(e) {
                var span = $(this).parent(),
                    field = filters.find('#'+span.data('for'));
                field.val('');
                field.find('option:selected').prop('selected', false);

                if (self._isDropdown(field))
                {
                    // Select2 requires event to be triggered
                    field.trigger("change");
                }
                span.remove();

                e.preventDefault();
                return false;
            });

            // Handle clicks on filter tag
            filters_list.on("click", self.options.filter_selector, function(e) {
                var span = $(this),
                    field = filters.find('#'+span.data('for'));
                self._changeFiltersPopupState("show");

                if (self._isDropdown(field))
                {
                    field.select2("open");
                }
                else
                {
                    field.focus();
                }

                e.preventDefault();
                return false;
            });
        },

        /**
         * Create tags for applied filters
         * @private
         */
        _tagFilters: function(filters, container) {
            var self = this;
            var html = filters.find("input, select").map(function() {
                var el = $(this),
                    v = $(this).val();
                if (!v)
                {
                    return;

                }

                if (self._isDropdown(el))
                {
                    v = $.map(el.find("option:selected"), function(el) { return $(el).text() })
                        .join(", ");
                }

                var id = $(this).attr('id'),
                    name = $(this).attr('title'),
                    title = v;

                // Shorten value
                if (v.length > 15) {
                    v = $.trim(v.substring(0, 12))+'...';
                }
                return self._applyTemplate(
                    self.options.filter_template,
                    { "id": id, "title": title, "name": name, "value": v }
                )
            }).get().join('');
            container.html(html);
        },

        /**
         * Check if given field is a "SELECT"
         * @param field
         * @returns {boolean}
         * @private
         */
        _isDropdown: function (field) {
            return (field.prop("tagName") == "SELECT")
        },

        /**
         * Replace {{ key }} with values from "params"
         * @param html - {String}
         * @param params - {Object}
         * @private
         * @returns {String}
         */
        _applyTemplate: function(html, params)
        {
            $.each(params, function (key, value) {
                html = html.replace("{{ " + key + " }}", value)
            });
            return html;
        },

        /**
         * Handler for Filters popup presence change
         * @param action - "show", "hide" or "toggle"
         */
        _changeFiltersPopupState: function (action) {
            if (action === "toggle") {
                action = this.filters_container.is(":visible")  ?  "hide"  :  "show";
            }

            if (action === "show") {
                this.filters_container.show();
                this._startOutsideClicksHandler()
            }
            else {
                this.filters_container.hide();
                this._stopOutsideClicksHandler();
            }
        },

        /**
         * Add event handler to document to:
         * - check if event target is outside of container
         * - hide filters popup
         */
        _startOutsideClicksHandler: function () {
            var self = this,
                filters = this.filters_container,
                filters_link = $(this.options.filters_link);

            // Hide when focus is lost
            $(document).on("mouseup.searchbar", function (e) {
                var $target = $(e.target);
                if (!filters.is(e.target) // if the target of the click isn't the container...
                    && filters.has(e.target).length === 0 // ... nor a descendant of the container
                    && !$target.hasClass('select2-results__option') // item selection should be ignored for select2
                    && !$target.parent().hasClass('select2-results__option') //
                    && !$target.hasClass('select2-search__field') // search field in select2
                    && !$target.is(filters_link) // if the target of the click isn't "Advanced" link
                    && !$target.parent().is(filters_link) //
                ) {
                    self._changeFiltersPopupState("hide");
                }
            });
        },

        /**
         *
         */
        _stopOutsideClicksHandler: function () {
            $(document).off("mouseup.searchbar");
        }
    });
});
