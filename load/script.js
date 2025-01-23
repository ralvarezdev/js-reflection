import EventEmitter from 'events';
import {pathToFileURL} from "url";
import {isClass, isFunction} from "./helpers.js";

// Errors that can be thrown by this class
export const SCRIPT_PATH_NOT_DEFINED_ERROR = new Error("Script path not defined")
export const OBJECT_NOT_DEFINED_ERROR = new Error("Object not defined")
export const OBJECT_NOT_FOUND_ERROR = "Object not found"
export const OBJECT_IS_NOT_A_FUNCTION_ERROR = "Object is not a function"
export const OBJECT_IS_NOT_A_CLASS_ERROR = "Object is not a class"

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
            await (async () => {
                return new Promise((resolve) => {
                    this.#eventEmitter.on('load', () => {
                        resolve(this.#loadedScript);
                    });
                });
            })()
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

    // Call a function from the script
    async callFunction(functionName, ...parameters) {
        // Get the function from the script
        const fn = await this.getFunction(functionName);

        // Call the function from the script
        return fn(...parameters);
    }

    // Call a method from an object in the script
    async callObjectMethod(objectName, methodName, ...parameters) {
        // Get the object from the script
        const object = await this.getObject(objectName);

        // Get the method
        const method = object[methodName];

        // Check if the method is a function
        if (!isFunction(method))
            throw new Error(OBJECT_IS_NOT_A_FUNCTION_ERROR + ": " + this.#scriptPath + ", " + objectName + "." + methodName);


        // Call the method from the object in the script
        return method(...parameters);
    }
}