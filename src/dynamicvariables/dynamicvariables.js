import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import DynamicVariablesEditing from './dynamicvariablesediting';
import DynamicVariablesUI from './dynamicvariablesui';

export default class DynamicVariables extends Plugin {
    static get requires() {
        return [ DynamicVariablesEditing, DynamicVariablesUI ];
    }
}
