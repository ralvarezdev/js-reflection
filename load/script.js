import EventEmitter from 'events';
import {pathToFileURL} from "url";
import {isClass, isFunction} from "./helpers.js";

// Errors that can be thrown by this class
export const SCRIPT_PATH_NOT_DEFINED_ERROR = new Error("Script path not defined")
export const OBJECT_NOT_DEFINED_ERROR = new Error("Object not defined")
export const OBJECT_NOT_FOUND_ERROR = "Object not found"
export const OBJECT_IS_NOT_A_FUNCTION_ERROR = "Object is not a function"
export const OBJECT_IS_NOT_A_CLASS_ERROR = "Object is not a class"
export const PROPERTY_NOT_FOUND_ERROR = "Property not found"
export const MISMATCHED_NUMBER_OF_PARAMETERS_ERROR = "Mismatched number of parameters"

// Script represents a module script in the file system
export default class Script {
    #scriptPath
    #loadingScript
    #loadedScript
    #eventEmitter

    // Path constructor
    constructor(scriptPath) {
        // If the script path is not defined, throw an error
        if (!scriptPath)
            throw SCRIPT_PATH_NOT_DEFINED_ERROR;

        // Create an event emitter
        this.#eventEmitter = new EventEmitter();

        // Add the file extension if it does not exist
        if (!scriptPath.endsWith('.js'))
            scriptPath += '.js'

        // Set the modules and script
        this.#scriptPath = pathToFileURL(scriptPath);
    }

    // Get the script path
    get scriptPath() {
        return this.#scriptPath
    }

    // Get the loaded script
    async loadedScript() {
        // Check if the script is already loaded
        if (this.#loadedScript)
            return this.#loadedScript;

        // Check if the script is already loading
        if (this.#loadingScript) {
            await new Promise((resolve) => {
                    this.#eventEmitter.on('load', () => {
                        resolve();
                    });
                });
            return this.#loadedScript
        }

        // Load the script
        this.#loadingScript = import(this.#scriptPath.href)
            .then(script => {
                // Set the loaded script
                this.#loadedScript = script;

                // Emit the load event
                this.#eventEmitter.emit('load');
                return script;
            })
            .catch(error => {
                this.#loadingScript = null;
                throw error;
            });

        // Wait for the script to load
        await this.#loadingScript

        return this.#loadedScript;
    }

    // Get an object from the script

    async getObject(objectName) {
        // Check if the object name is not defined
        if (!objectName)
            throw OBJECT_NOT_DEFINED_ERROR;

        // Get the loaded script
        const script = await this.loadedScript();

        // Check if the object is not found
        if (!script?.[objectName])
            throw new Error(OBJECT_NOT_FOUND_ERROR + ": " + this.#scriptPath + ", " + objectName);

        // Return the object from the script
        return script[objectName];
    }

    // Get object property from the script
    async getObjectProperty(objectName, propertyName) {
        // Get the object from the script
        const object = await this.getObject(objectName);

        // Get the property
        const property = object[propertyName];

        // Check if the property is not found
        if (!property)
            throw new Error(PROPERTY_NOT_FOUND_ERROR+ ": " + this.#scriptPath + ", " + objectName + "." + propertyName);

        return property
    }

    // Get nested object property from the script
    async getNestedObjectProperty(objectName, ...propertyNames) {
        // Get the object from the script
        let object = await this.getObject(objectName);

        // Get the nested property
        for (const propertyName of propertyNames) {
            // Get the property
            const property = object[propertyName];

            // Check if the property is not found
            if (!property)
                throw new Error(PROPERTY_NOT_FOUND_ERROR + ": " + this.#scriptPath + ", " + objectName + "." + propertyName);

            // Set the object to the property
            object = property;
        }

        return object
    }

    // Get a function from the script
    async getFunction(functionName) {
        // Get the object from the script
        const object= await this.getObject(functionName);

        // Check if the object is a function
        if (!isFunction(object))
            throw new Error(OBJECT_IS_NOT_A_FUNCTION_ERROR + ": " + this.#scriptPath + ", " + functionName);

        return object;
    }

    // Get a class from the script
    async getClass(className) {
        // Get the object from the script
         const object=await this.getObject(className);

         // Check if the object is a class
            if (!isClass(object))
                throw new Error(OBJECT_IS_NOT_A_CLASS_ERROR + ": " + this.#scriptPath + ", " + className);

            return object;
    }

    // Initialize a script class from the script
    async callNew(className, ...parameters) {
        // Get the class from the script
        const Class = await this.getClass(className);

        // Return a new instance of the class
        return new Class(parameters);
    }

    // Initialize a script class from the script with the same number of parameters
    async safeCallNew(className, ...parameters) {
        // Get the class from the script
        const Class = await this.getClass(className);

        // Check if the number of parameters is the same
        if (Class.length !== parameters.length)
            throw new Error(MISMATCHED_NUMBER_OF_PARAMETERS_ERROR + ": " + this.#scriptPath + ", " + className);

        // Return a new instance of the class
        return new Class(parameters);
    }

    // Call a function from the script
    async callFunction(functionName, ...parameters) {
        // Get the function from the script
        const fn = await this.getFunction(functionName);

        // Call the function from the script
        return fn(...parameters);
    }

    // Call a function from the script with the same number of parameters
    async safeCallFunction(functionName, ...parameters) {
        // Get the function from the script
        const fn = await this.getFunction(functionName);

        // Check if the number of parameters is the same
        if (fn.length !== parameters.length)
            throw new Error(MISMATCHED_NUMBER_OF_PARAMETERS_ERROR + ": " + this.#scriptPath + ", " + functionName);

        // Call the function from the script
        return fn(...parameters);
    }

    // Call a method from an object in the script
    async callObjectMethod(objectName, methodName, ...parameters) {
        // Get the object method from the script
        const method = await this.getObjectProperty(objectName, methodName);

        // Check if the method is a function
        if (!isFunction(method))
            throw new Error(OBJECT_IS_NOT_A_FUNCTION_ERROR + ": " + this.#scriptPath + ", " + objectName + "." + methodName);


        // Call the method from the object in the script
        return method(...parameters);
    }

    // Call a method from an object in the script with the same number of parameters
    async safeCallObjectMethod(objectName, methodName, ...parameters) {
        // Get the object method from the script
        const method = await this.getObjectProperty(objectName, methodName);

        // Check if the method is a function
        if (!isFunction(method))
            throw new Error(OBJECT_IS_NOT_A_FUNCTION_ERROR + ": " + this.#scriptPath + ", " + objectName + "." + methodName);

        // Check if the number of parameters is the same
        if (method.length !== parameters.length)
            throw new Error(MISMATCHED_NUMBER_OF_PARAMETERS_ERROR + ": " + this.#scriptPath + ", " + objectName + "." + methodName);

        // Call the method from the object in the script
        return method(...parameters);
    }
}