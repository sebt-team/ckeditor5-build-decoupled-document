import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { addListToDropdown, createDropdown } from '@ckeditor/ckeditor5-ui/src/dropdown/utils';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import Model from '@ckeditor/ckeditor5-ui/src/model';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';

import tippy from 'tippy.js';

export default class DynamicVariablesrUI extends Plugin {
    init() {
        const editor = this.editor;
        const t = editor.t;
        const dynamicVariablesNames = editor.config.get( 'dynamicVariablesConfig.types' );

        const view = editor.editing.view;
        const viewDocument = view.document;

        view.addObserver( ClickObserver );

        let toolTipList = []

        // draw elemen on ui
        let buildUi = (value)=> {
            editor.execute( 'dynamicVariables', { value: value } );
            editor.editing.view.focus();


            debugger;
            // set tippy tooltip
            let viewElement = editor.editing.view.getDomRoot().getElementsByClassName('ck-widget_selected')[0];
            let idElement = viewElement.getAttribute("id");
            let placeholderTextElement = viewElement.getAttribute("placeholder");
            
            let toolTip = tippy(`#${idElement}`, {
                content: placeholderTextElement
            });
            
            // remove another tooltips linked to element
            if(toolTipList.length) {
                let repeatdedToolTip = toolTipList.find(currentToolTip => currentToolTip.reference.id === idElement);
                if(repeatdedToolTip) {
                    repeatdedToolTip.destroy();
                    toolTipList.splice(toolTipList.indexOf(repeatdedToolTip), 1);
                }
            }
            toolTipList.push(toolTip[0]);
        }

        // The "dynamicVariables" dropdown must be registered among the UI components of the editor
        // to be displayed in the toolbar.
        editor.ui.componentFactory.add( 'dynamicVariables', locale => {
            const dropdownView = createDropdown( locale );

            // Populate the list in the dropdown with items.
            addListToDropdown( dropdownView, getDropdownItemsDefinitions( dynamicVariablesNames ) );

            dropdownView.buttonView.set( {
                // The t() function helps localize the editor. All strings enclosed in t() can be
                // translated and change when the language of the editor changes.
                label: t( 'Variables' ),
                tooltip: true,
                withText: true
            } );

            // Disable the dynamicVariables button when the command is disabled.
            const command = editor.commands.get( 'dynamicVariables' );
            dropdownView.bind( 'isEnabled' ).to( command );

            // Execute the command when the dropdown item is clicked (executed).
            this.listenTo( dropdownView, 'execute', evt => {
                let commandParam = evt.source.commandParam;
                buildUi(evt.source.commandParam);
            } );

            debugger;
            return dropdownView;
        } );

        editor.listenTo( viewDocument, 'click', ( evt, data ) => {
            const modelElement = editor.editing.mapper.toModelElement( data.target);
            
            if (modelElement) {
                if ( modelElement.name == 'dynamicVariables' ) {
                    let commandParam = modelElement._attrs.get("name")
                    buildUi(commandParam);
                }
            }
        } );

        debugger;

        editor.on('change', function(evt) { 
            let elementList = editor.editing.view.getDomRoot().getElementsByClassName('dynamic-variables')
            setTimeout(()=> {
                for (let viewElement of elementList) {
                    let idElement = viewElement.getAttribute("id");
                    let placeholderTextElement = viewElement.getAttribute("placeholder");

                    let toolTip = tippy(`#${idElement}`, {
                        content: placeholderTextElement
                    });

                    toolTipList.push(toolTip[0]);
                }
            }, 1000);
        }); 
    }
}

function getDropdownItemsDefinitions( dynamicVariablesNames ) {
    const itemDefinitions = new Collection();

    for ( const name of dynamicVariablesNames ) {
        const definition = {
            type: 'button',
            model: new Model( {
                commandParam: name,
                label: name,
                withText: true
            } )
        };

        // Add the item definition to the collection.
        itemDefinitions.add( definition );
    }

    return itemDefinitions;
}
