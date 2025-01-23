import EventEmitter from 'events';

// Errors that can be thrown by this class
export const SCRIPT_NOT_DEFINED_ERROR = new Error("Script not defined")
export const CLASS_NOT_DEFINED_ERROR = new Error("Class not defined")
export const CLASS_NOT_FOUND_ERROR = "Class not found"
export const OBJECT_NOT_DEFINED_ERROR = new Error("Object not defined")
export const OBJECT_NOT_FOUND_ERROR = "Object not found"

// Script represents a module script in the file system
export default class Script {
    #nestedModules
    #scriptName
    #script
    #loadingScript
    #loadedScript
    #fullPath
    #eventEmitter

    // Path constructor
    constructor(scriptName, ...modules) {
        // If the script name is not defined, throw an error
        if (!scriptName)
            throw SCRIPT_NOT_DEFINED_ERROR;

        // Create an event emitter
        this.#eventEmitter = new EventEmitter();

        // Format the script name
        scriptName = scriptName.trim()

        // Add the file extension if it does not exist
        if (!scriptName.endsWith('.js'))
            scriptName += '.js'

        // Set the modules and script
        this.#nestedModules = modules;
        this.#scriptName = scriptName;
    }

    // Get the full path
    get fullPath() {
        // If the full path is already defined, return it
        if (this.#fullPath)
            return this.#fullPath;

        // Get the full path
        this.#fullPath = [this.#nestedModules.join('/'), this.#scriptName].join('/');
        return this.#fullPath;
    }

    // Check if it has a nested module
    hasNestedModule() {
        return this.#nestedModules.length > 0;
    }

    // Get the nested module
    get nestedModule() {
        // If there are no modules, return null
        if (!this.hasNestedModule())
            return null;
        return this.#nestedModules[0];
    }

    // Remove the nested module
    removeNestedModule() {
        this.#nestedModules.shift();
    }

    // Get the script
    get script() {
        return this.#script;
    }

    // Get the loaded script
    async loadedScript() {
        // Check if the script is already loaded
        if (this.#loadedScript)
            return this.#loadedScript;

        // Check if the script is already loading
        if (this.#loadingScript) {
            const waitForEvent = async () => {
                return new Promise((resolve) => {
                    this.#eventEmitter.once('load', () => {
                        resolve(this.#loadedScript);
                    });
                });
            };
        }

        // Load the script
        this.#loadingScript = import(this.fullPath)
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
        await this.#loadingScript;

        // Return the loaded script
        return this.#loadedScript;
    }

    // Initialize a script class
    async new(className, ...parameters) {
        // Check if the class name is not defined
        if (!className)
            throw CLASS_NOT_DEFINED_ERROR;

        // Get the loaded script
        const script = await this.loadedScript();

        // Check if the class is not found
        if (!script[className])
            throw new Error(CLASS_NOT_FOUND_ERROR + ": " + this.fullPath + ", "+ className);

        // Get the class from the script
        const Class = script[className]

        // Return a new instance of the class
        return new Class(parameters);
    }

    // Get an object from the script
    async object(objectName) {
        // Check if the object name is not defined
        if (!objectName)
            throw OBJECT_NOT_DEFINED_ERROR;

        // Get the loaded script
        const script = await this.loadedScript();

        // Check if the object is not found
        if (!script[objectName])
            throw new Error(OBJECT_NOT_FOUND_ERROR + ": "+ this.fullPath + ", "+ objectName);

        // Return the object from the script
        return script[objectName];
    }

    // Call a function from the script
    async callFunction(functionName, ...parameters) {
        // Get the function
        const fn = await this.object(functionName);

        // Call the function from the script
        return fn(...parameters);
    }

    // Call a method from an object in the script
    async callObjectMethod(objectName, methodName, ...parameters) {
        // Get the object
        const object = await this.object(objectName);

        // Get the method
        const method = object[methodName];

        // Call the method from the object in the script
        return method(...parameters);
    }
}