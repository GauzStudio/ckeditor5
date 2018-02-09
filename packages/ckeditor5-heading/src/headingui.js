/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module heading/headingui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Model from '@ckeditor/ckeditor5-ui/src/model';

import { createDropdown, addListToDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';

import Collection from '@ckeditor/ckeditor5-utils/src/collection';

import '../theme/heading.css';

/**
 * The headings UI feature. It introduces the `headings` drop-down.
 *
 * @extends module:core/plugin~Plugin
 */
export default class HeadingUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;
		const options = this._getLocalizedOptions();
		const defaultTitle = t( 'Choose heading' );
		const dropdownTooltip = t( 'Heading' );

		// Register UI component.
		editor.ui.componentFactory.add( 'headings', locale => {
			const commands = [];
			const dropdownItems = new Collection();

			for ( const option of options ) {
				const command = editor.commands.get( option.model );
				const itemModel = new Model( {
					commandName: option.model,
					label: option.title,
					class: option.class
				} );

				itemModel.bind( 'isActive' ).to( command, 'value' );

				// Add the option to the collection.
				dropdownItems.add( itemModel );

				commands.push( command );
			}

			const dropdownView = createDropdown( locale );
			addListToDropdown( dropdownView, dropdownItems );

			dropdownView.buttonView.set( {
				isOn: false,
				withText: true,
				tooltip: dropdownTooltip
			} );

			dropdownView.extendTemplate( {
				attributes: {
					class: [
						'ck-heading-dropdown'
					]
				}
			} );

			dropdownView.bind( 'isEnabled' ).toMany( commands, 'isEnabled', ( ...areEnabled ) => {
				return areEnabled.some( isEnabled => isEnabled );
			} );

			dropdownView.buttonView.bind( 'label' ).toMany( commands, 'value', ( ...areActive ) => {
				const index = areActive.findIndex( value => value );

				// If none of the commands is active, display default title.
				return options[ index ] ? options[ index ].title : defaultTitle;
			} );

			// Execute command when an item from the dropdown is selected.
			this.listenTo( dropdownView, 'execute', evt => {
				editor.execute( evt.source.commandName );
				editor.editing.view.focus();
			} );

			return dropdownView;
		} );
	}

	/**
	 * Returns heading options as defined in `config.heading.options` but processed to consider
	 * editor localization, i.e. to display {@link module:heading/heading~HeadingOption}
	 * in the correct language.
	 *
	 * Note: The reason behind this method is that there's no way to use {@link module:utils/locale~Locale#t}
	 * when the user config is defined because the editor does not exist yet.
	 *
	 * @private
	 * @returns {Array.<module:heading/heading~HeadingOption>}.
	 */
	_getLocalizedOptions() {
		const editor = this.editor;
		const t = editor.t;
		const localizedTitles = {
			Paragraph: t( 'Paragraph' ),
			'Heading 1': t( 'Heading 1' ),
			'Heading 2': t( 'Heading 2' ),
			'Heading 3': t( 'Heading 3' )
		};

		return editor.config.get( 'heading.options' ).map( option => {
			const title = localizedTitles[ option.title ];

			if ( title && title != option.title ) {
				// Clone the option to avoid altering the original `config.heading.options`.
				option = Object.assign( {}, option, { title } );
			}

			return option;
		} );
	}
}

/**
 * The configuration of the heading feature. Introduced by the {@link module:heading/headingediting~HeadingEditing} feature.
 *
 * Read more in {@link module:heading/heading~HeadingConfig}.
 *
 * @member {module:heading/heading~HeadingConfig} module:core/editor/editorconfig~EditorConfig#heading
 */

/**
 * The configuration of the heading feature.
 * The option is used by the {@link module:heading/headingediting~HeadingEditing} feature.
 *
 *		ClassicEditor
 *			.create( {
 * 				heading: ... // Heading feature config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface HeadingConfig
 */

/**
 * The available heading options.
 *
 * The default value is:
 *
 *		const headingConfig = {
 *			options: [
 *				{ model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
 *				{ model: 'heading1', view: 'h2', title: 'Heading 1', class: 'ck-heading_heading1' },
 *				{ model: 'heading2', view: 'h3', title: 'Heading 2', class: 'ck-heading_heading2' },
 *				{ model: 'heading3', view: 'h4', title: 'Heading 3', class: 'ck-heading_heading3' }
 *			]
 *		};
 *
 * It defines 3 levels of headings. In the editor model they will use `heading1`, `heading2`, and `heading3` elements.
 * Their respective view elements (so the elements output by the editor) will be: `h2`, `h3`, and `h4`. This means that
 * if you choose "Heading 1" in the headings dropdown the editor will turn the current block to `<heading1>` in the model
 * which will result in rendering (and outputting to data) the `<h2>` element.
 *
 * The `title` and `class` properties will be used by the `headings` dropdown to render available options.
 * Usually, the first option in the headings dropdown is the "Paragraph" option, hence it's also defined on the list.
 * However, you don't need to define its view representation because it's handled by
 * the {@link module:paragraph/paragraph~Paragraph} feature (which is required by
 * the {@link module:heading/headingediting~HeadingEditing} feature).
 *
 * You can **read more** about configuring heading levels and **see more examples** in
 * the {@glink features/headings Headings} guide.
 *
 * Note: In the model you should always start from `heading1`, regardless of how the headings are represented in the view.
 * That's assumption is used by features like {@link module:autoformat/autoformat~Autoformat} to know which element
 * they should use when applying the first level heading.
 *
 * The defined headings are also available in {@link module:core/commandcollection~CommandCollection} under their model names.
 * For example, the below code will apply `<heading1>` to the current selection:
 *
 *		editor.execute( 'heading1' );
 *
 * @member {Array.<module:heading/heading~HeadingOption>} module:heading/heading~HeadingConfig#options
 */

/**
 * Heading option descriptor.
 *
 * This format is compatible with {@link module:engine/conversion/definition-based-converters~ConverterDefinition}
 * and adds to additional properties: `title` and `class`.
 *
 * @typedef {Object} module:heading/heading~HeadingOption
 * @extends module:engine/conversion/definition-based-converters~ConverterDefinition
 * @property {String} title The user-readable title of the option.
 * @property {String} class The class which will be added to the dropdown item representing this option.
 */
