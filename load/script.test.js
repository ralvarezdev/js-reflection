import Script from "./script.js";
import {test} from 'node:test';
import assert from 'node:assert';
import * as path from "node:path";
import {fileURLToPath} from "url";
import {dirname} from "path";

// Get the file name and directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test file path
const testFilePath = path.join(__dirname, "index.test.js")
console.log("Directory name: " + __dirname)
console.log("Test script file path: " + testFilePath)

// Test the Script class by importing an object
test("import 'obj' object", async () => {
        const obj = await new Script(testFilePath).getObject('obj')
        assert.strictEqual(obj, "hello")
    }
)

// Test the Script class by importing a function and calling it
test("import 'func' function", async () => {
        const result = await new Script(testFilePath).callFunction('func')
        assert.strictEqual(result, "hello")
    }
)

// Test the Script class by importing an object and calling a method
test("import 'objMethod' object and call 'method'", async () => {
        const result = await new Script(testFilePath).callObjectMethod('objMethod', 'method')
        assert.strictEqual(result, "hello")
    }
)

// Test the Script class by importing a class and creating an instance
test("import 'Class' class", async () => {
        const instance = await new Script(testFilePath).callNew('Class')
        assert.strictEqual(instance.name, "hello")
    }
)

// Test the Script class by importing a class and getting its methods
test("import 'Class' class and get its methods", async () => {
        const methods = await new Script(testFilePath).getClassMethods('Class')
        console.log("Methods")
        for (const method in methods)
            console.log(method+": "+methods[method])
        assert.notEqual(methods, {})
    }
)