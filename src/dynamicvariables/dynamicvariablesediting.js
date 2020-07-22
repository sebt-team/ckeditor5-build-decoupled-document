import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import { toWidget, viewToModelPositionOutsideModelElement } from '@ckeditor/ckeditor5-widget/src/utils';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

import DynamicVariablesCommand from './dynamicvariablescommand'; 

import './theme/tippy.css';
import './theme/dynamicvariables.css';


export default class DynamicVariablesEditing extends Plugin {
    static get requires() {
        return [ Widget ];
    }

    init() {
        console.log( 'DynamicVariablesEditing#init() got called' );

        this._defineSchema();
        this._defineConverters();

        this.editor.commands.add( 'dynamicVariables', new DynamicVariablesCommand( this.editor ) );

        this.editor.editing.mapper.on(
            'viewToModelPosition',
            viewToModelPositionOutsideModelElement( this.editor.model, viewElement => viewElement.hasClass( 'dynamic-variables' ) )
        );
        this.editor.config.define( 'dynamicVariablesConfig', {
            types: [ 'date', 'first name', 'surname' ]
        } );
    }

    _defineSchema() {
        const schema = this.editor.model.schema;

        schema.register( 'dynamicVariables', {
            // Allow wherever text is allowed:
            allowWhere: '$text',

            // The dynamicVariables will act as an inline node:
            isInline: true,

            // The inline widget is self-contained so it cannot be split by the caret and it can be selected:
            isObject: true,

            // The dynamicVariables can have many types, like date, name, surname, etc:
            allowAttributes: [ 'name', 'placeholder' ]
        } );
    }

    _defineConverters() {
        const conversion = this.editor.conversion;

        conversion.for( 'upcast' ).elementToElement( {
            view: {
                name: 'span',
                classes: [ 'dynamic-variables' ]
            },
            model: ( viewElement, modelWriter ) => {
                // Extract the "name" from "{name}".
                const name = viewElement.getChild( 0 ).parent._attrs.get("placeholder-type")
                const placeholder = viewElement.getChild( 0 ).parent._attrs.get("placeholder")
                return modelWriter.createElement( 'dynamicVariables', { name, placeholder: placeholder, }  );
            }
        } );

        conversion.for( 'editingDowncast' ).elementToElement( {
            model: 'dynamicVariables',
            view: ( modelItem, viewWriter ) => {
                const widgetElement = createDynamicVariablesView( modelItem, viewWriter );

                // Enable widget handling on a dynamicVariables element inside the editing view.
                return toWidget( widgetElement, viewWriter );
            }
        } );

        conversion.for( 'dataDowncast' ).elementToElement( {
            model: 'dynamicVariables',
            view: createDynamicVariablesView
        } );

        // Helper method for both downcast converters.
        function createDynamicVariablesView( modelItem, viewWriter ) {
            const name = modelItem.getAttribute( 'name' );
            const placeholder = modelItem.getAttribute( 'placeholder' );

            const dynamicVariablesView = viewWriter.createContainerElement( 'span', {
                class: 'dynamic-variables dynamic-variables-tooltip',
                "placeholder": placeholder,
                "placeholder-type": name,
                id: "elm-" + Math.random().toString(36).substr(2,5)
            });

            // Insert the dynamicVariables name (as a text).
            const innerText = viewWriter.createText( '{' + name + '}' );
            viewWriter.insert( viewWriter.createPositionAt( dynamicVariablesView, 0 ), innerText );

            // const tooltipView = viewWriter.createContainerElement( 'span', { 
            //     class: 'tooltiptext'
            // });
            // if(placeholder && placeholder != '') {
            //     const innerTooltipText = viewWriter.createText( placeholder );
            //     viewWriter.insert( viewWriter.createPositionAt( tooltipView, 1 ), innerTooltipText );
            //     viewWriter.insert( viewWriter.createPositionAt( dynamicVariablesView, 1 ), tooltipView);
            // }

            return dynamicVariablesView;
        }
    }
}