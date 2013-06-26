Meteor.Stream.Permission = function (acceptAll, cacheAll) {
  var options = {
    "read": {
      results: {}
    }, 
    "write": {
      results: {}
    }
  };

  this.read = function(func, cache) {
    options['read']['func'] = func;
    options['read']['doCache'] = (cache === undefined)? cacheAll: cache; 
  };

  this.write = function(func, cache) {
    options['write']['func'] = func;
    options['write']['doCache'] = (cache === undefined)? cacheAll: cache; 
  };

  this.checkPermission = function(type, userId, eventName) {
    var namespace = userId + '-' + eventName;
    var result = options[type].results[namespace];
    
    if(result === undefined) {
      var func = options[type].func;
      if(func) {
        result = func(userId, eventName);
        if(options[type].doCache) {
          options[type].results[namespace] = result;
          return result;
        }
      } else {
        return acceptAll;
      }
    } else {
      return result;
    }
  };  
}