
'use strict';

var RCTTestModule = require('NativeModules').TestModule;
var React = require('react');
var ReactNative = require('react-native');
var {
  Text,
  View,
} = ReactNative;
var RNFS = require('react-native-fs');
var DEBUG = true;


// setup in componentDidMount
var done;
var updateMessage;

function runTestCase(description, fn) {
  updateMessage(description);
  fn();
}

function expectTrue(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function expectEqual(lhs, rhs, testname) {
  expectTrue(
    lhs === rhs,
    'Error in test ' + testname + ': expected ' + rhs + ', got ' + lhs
  );
}

function expectFSNoError(err) {
  expectTrue(err === null, 'Unexpected FS error: ' + JSON.stringify(err));
}

function testWriteAndReadFile() {
  var path = RNFS.DocumentDirectoryPath + '/test.txt';

  var text = 'Lorem ipsum dolor sit amet';
  var readText;

  RNFS.writeFile(path, text)
    .then((success) => {
      updateMessage('FILE WRITTEN!');
      return RNFS.readFile(path);
    })
    .then((contents) => {
      updateMessage('FILE READ! Contents:');
      readText = contents;
      expectEqual(text, readText, 'testWriteAndReadFile');
      updateMessage('readFile correctly returned' + readText);
    })
    .finally(() => {
      runTestCase('testCreateAndDeleteFile', testCreateAndDeleteFile);
    })
    .done();//promise done needed to throw exception so that in case test fails,error is propagated
}



function testCreateAndDeleteFile() {

  const content = 'Lorem ipsum dolor sit amet';
    // create a path you want to write to
  var path = RNFS.DocumentDirectoryPath + '/test.txt';

  // write the file
  RNFS.writeFile(path, content, 'utf8')
    .then((success) => {
      console.log(path+' --> WRITTEN!');
    })
    .catch((err) => {
      console.log(err.message);
    });

  RNFS.readFile(path, 'utf8')
    .then((result) => {
     // log the file contents
     if ( content === result ) console.log(content+' === '+result);
       else console.log(content+' !== '+result);
    })
    .catch((err) => {
       console.log(err.message, err.code);
    });

  RNFS.unlink(path)
    .then(() => {
      console.log(path+' --> DELETED');
    })
    // `unlink` will throw an error, if the item to unlink does not exist
    .catch((err) => {
      console.log(err.message);
    });
}




var FSTest = React.createClass({
  getInitialState() {
      return {
        messages: 'Initializing...',
        done: false,
      };
    },

    componentDidMount() {
      done = () => this.setState({
        done: true
      }, RCTTestModule.markTestCompleted);
      updateMessage = (msg) => {
        this.setState({
          messages: this.state.messages.concat('\n' + msg)
        });
        DEBUG && console.log(msg);
      };
      testWriteAndReadFile();
    },

    render() {
      return (
      <View style={{backgroundColor: 'white', padding: 40}}>
        <Text>
          {this.constructor.displayName + ': '}
          {this.state.done ? 'Done' : 'Testing...'}
          {'\n\n' + this.state.messages}
        </Text>
      </View>
      );
    }
});

module.exports = FSTest;
