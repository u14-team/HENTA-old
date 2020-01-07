import Henta from './index';

export default class Util {
  henta: Henta;

  /**
  * Loads a json file from the settings folder
  * @param {String} path path or file name
  * @return {Promise<any>} contents of the file in json format
  */
  loadSettings(path: String): Promise<any>;

  /**
  * Gets a random element from array
  * @param {Array<any>} array array from which to get element
  * @return {any} random element
  */
  pickRandom(array: Array<any>): any;

  /**
  * Gets a random index from array
  * @param {Array<any>} array array from which to get element index
  * @return {Number} random index
  */
 pickRandomIndex(array: Array<any>): Number;

  /**
  * Creates an object where the keys belong to the slug values from the passed table.
  * Useful when you need to frequently access an element by slug.
  * @param {Array<any>} array array from which the object will be created
  * @return {any} object with keys
  */
  createFromSlug(array: Array<any>): any;

  /**
  * Divides a large array into several small ones with a fixed array (or less if there is a remainder)
  * @param {Array<any>} array array to be split
  * @param {Number} chunkSize size of each chunk
  * @return {Array<Array<any>>} chunks
  */
  chunk(array: Array<any>, chunkSize: Number): Array<Array<any>>;
}
