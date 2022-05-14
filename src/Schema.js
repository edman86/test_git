import { minimum, maximum, checkEmail, checkPhoneNumber, checkUrl, checkPassword } from './helpers/validators';
import { createInputName } from './helpers/createInputName';
import { v4 as uuidv4 } from 'uuid';


class Schema {
    /**
    * A class representing a form schema
    * 
    * @param  {Object} schema - The javascript object representing form schema
    * @property {Object} schema - The javascript object representing form schema
    * @property {Object} rules - An object that describes the rules for creating 
    * and validating a form. Created by a class based on a schema
    * @property {Object} validators - Object with preset validation methods
    */
    constructor(schema) {
        this.schema = schema || {};
        this.rules = {};
        this.validators = {
            min: minimum,
            max: maximum,
            email: checkEmail,
            phone: checkPhoneNumber,
            url: checkUrl,
            password: checkPassword
        };
        this._createRules();
    }

    /**
    * Creates an object based on a schema that contains a description of 
    * the form - the number of inputs, their type, validation types, etc.
    * @private
    */
    _createRules = () => {
        for (let rule of Object.keys(this.schema)) {

            let message;
            let vals = [];
            let extras = {};
            let rules = {};
            let validators = [];

            rules.type = this.schema[rule].type;

            if (this.schema[rule].hasOwnProperty('message')) {
                message = this.schema[rule].message;
            }

            // if validators are not repesented by an array
            if (!Array.isArray(this.schema[rule].validators)) {
                validators.push(this.schema[rule].validators);
            } else {
                validators = [...this.schema[rule].validators];
            }

            validators.forEach(validator => {
                if (typeof validator === 'object') {
                    // If validator is an object => 
                    // object's key goes to 'vals' array 
                    // and value goes to 'extras' list.
                    // Example: vals['min', 'max'], extras{min: 3, max: 8}
                    let validatorName;
                    let validatorExtra;

                    for (let [key, value] of Object.entries(validator)) {
                        validatorName = key;
                        validatorExtra = value;
                    }

                    if (validatorName === 'required') {
                        rules.required = true;
                    } else {
                        vals.push(validatorName);
                        extras[validatorName] = validatorExtra;
                    }
                } else {
                    if (typeof validator === 'string' && validator.toLowerCase() === 'required') {
                        rules.required = true;
                    } else if (typeof validator === 'function') {
                        vals.push(validator);
                    } else {
                        vals.push(validator.toLowerCase());
                    }
                }
            });

            // Every validator must be an object with validate function.
            // That's why we invoke standart validators at this.validators property.
            // And in order to call them, we use the string representation of the validators.
            // Example: this.validators['min']({min: 3}, 'must contain min {min} chars')
            // will create an object => {
            //   validate: ('Ada Lovelace') => {
            //          return 'Ada Lovelace'.length >= 3;
            //      },
            //      must contain min 3 chars
            //   }

            rules.validators = vals.map(val => {
                if (typeof val === 'function') {
                    return val(extras, message);
                } else {
                    return this.validators[val](extras, message)
                }
            });

            // creating rule
            this.rules[rule] = rules;
        }
    }

    /**
    * Creates an array with inputs to be passed to the form component for rendering
    * @return {Array<Object>} An array of objects describing form elements
    */
    createInputsArray = () => {
        let inputs = [];

        for (let [inputName, inputData] of Object.entries(this.rules)) {
            let inputType;
            let label;
            let value;
            let required;

            if (inputData.type === 'string' && inputName.toLowerCase().includes('password')) {
                inputType = 'password';
                value = '';
            } else if (inputData.type === 'string') {
                inputType = 'text';
                value = '';
            } else if (inputData.type === 'numeric') {
                inputType = 'number';
                value = 0;
            } else if (inputData.type.toLowerCase().includes('array')) {
                inputType = 'array';
                value = [];
            }

            if (inputData.required) {
                required = true;
            } else {
                required = false;
            }

            label = createInputName(inputName);

            inputs.push({
                id: uuidv4(),
                name: inputName,
                label: label,
                type: inputType,
                value: value,
                required: required,
                errorMessage: '',
                isValid: true
            });
        }

        return inputs;
    }

    /**
    * Validates form elements
    * @param  {Array<Object>} payload - An array of objects describing form elements
    * @return {Array<Object>} An array with validated form elements
    */
    validate = (payload) => {
        const inputs = [...payload];

        const updatedInputs = inputs.map(input => {
            let updInput = input;
            if (input.required && !input.value) {
                updInput = { ...input, isValid: false, errorMessage: 'The input field must not be empty!' }
            } else if (!input.value) {
                updInput = { ...input, isValid: true, errorMessage: '' };
            } else if (input.type === 'array' && !input.value.length && !input.required) {
                updInput = { ...input, isValid: true, errorMessage: '' };
            } else {
                for (let validator of this.rules[input.name].validators) {
                    let isValid;
                    if (Array.isArray(input.value)) {
                        for (let val of input.value) {
                            isValid = validator.validate(val);
                            if (!isValid) break;
                        }
                    } else {
                        isValid = validator.validate(input.value);
                    }

                    if (!isValid) {
                        updInput = { ...input, isValid: false, errorMessage: validator.message };
                        break;
                    } else {
                        updInput = { ...input, isValid: true, errorMessage: '' };
                    }
                }
            }
            return updInput;
        });
        return updatedInputs;
    }
}

export default Schema;