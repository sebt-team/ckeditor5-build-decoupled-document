import Command from '@ckeditor/ckeditor5-core/src/command';

export default class DynamicVariablesCommand extends Command {
    execute( { value } ) {

        const placeholder = prompt( 'Insert Variable' );

        const editor = this.editor;

        editor.model.change( writer => {
            // Create a <dynamicVariables> elment with the "name" attribute...
            const dynamicVariables = writer.createElement( 'dynamicVariables', { name: value, placeholder: placeholder } );

            // ... and insert it into the document.
            editor.model.insertContent( dynamicVariables );

            // Put the selection on the inserted element.
            writer.setSelection( dynamicVariables, 'on' );
        } );
    }

    refresh() {
        const model = this.editor.model;
        const selection = model.document.selection;

        const isAllowed = model.schema.checkChild( selection.focus.parent, 'dynamicVariables' );

        this.isEnabled = isAllowed;
    }
}