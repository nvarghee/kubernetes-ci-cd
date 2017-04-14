'use strict';
var request = require('request');
var Etcd = require('node-etcd')

module.exports = function(Crossword) {

  var etcd = new Etcd("http://example-etcd-cluster-client-service:2379");

  Crossword.get = function(cb) {
    
    var cachedPuzzle = etcd.getSync("puzzle");
    
    if (cachedPuzzle && !cachedPuzzle.err) {
      
      console.log(`cached puzzle: ${cachedPuzzle}`);
      fireHit();
      // TODO Set fromCache:true
      cb(null, JSON.parse(cachedPuzzle));
    } else {
      Crossword.findOne(function(err, crossword) {
        fireHit();
        if(err) {
          handleError(err.message, cb);
        } else {
          var puzzleString = JSON.stringify(crossword);
          etcd.setSync("puzzle", puzzleString, { ttl: 30 });
          console.log(`From mongo: ${puzzleString}`);
          crossword.fromCache=false;
          cb(null, crossword);
        }
      });
    }
  }

  Crossword.put = function(words, cb) {
    if(words) {
      Crossword.findOne(function (err, crossword) {
        fireHit();
        if (err) handleError(err.message, cb);
        for (var j = 0; j < words.length; j++) {
          var word = words[j];
          var updatedWords = [];
          for (var i = 0; i < crossword.words.length; i++) {
            var crosswordWord = crossword.words[i];
            if (crosswordWord.wordNbr === word.wordNbr && crosswordWord.wordOrientation === word.wordOrientation) {
              crosswordWord.enteredValue = word.enteredValue;
              //crosswordWord.wordOrientation = word.wordOrientation;
            }
            updatedWords.push(crosswordWord);
          }
        }
        crossword.updateAttribute('words', updatedWords, function (err, crossword) {
          if (err) handleError(err.message, cb);
          cb(null);
        });
      });
    }
    else handleError('word array is required', cb, 400)
  }

  Crossword.clear = function(cb) {
    Crossword.findOne(function(err, crossword) {
      fireHit();
      if(err) handleError(err.message, cb);
      var updatedWords = [];
      for (var i = 0; i < crossword.words.length; i++) {
        var crosswordWord = crossword.words[i];
        crosswordWord.enteredValue = undefined;
        updatedWords.push(crosswordWord);
      }
      crossword.updateAttribute('words', updatedWords, function(err, crossword) {
        if(err) handleError(err.message, cb);
        cb(null);
      });
    });
  }

  function fireHit() {
    var podId = process.env.HOSTNAME;
    var url = "http://monitor-scale:3001/hit/" + podId;
    request(url);
  }

  function handleError(msg, cb, status) {
    var error = new Error(msg);
    error.status = status | 500;
    return cb(error);
  }
};
