function sendEmail() {
  service.sendEmail();
}

var config = {
  url: 'https://github.com/trending',
  contents: ['name', 'star', 'description'],

  email: 'your email address',

  // time span
  time: {
    daily: 1,
    weekly: 1,
    monthly: 1
  },

  // language
  language: {
    javascript: 1,
    go: 1,
    cpp: 1,
    python: 1
  }
};

var service = {

  _getTrendingValues: function(url) {
    var response = UrlFetchApp.fetch(url);

    // Repository trending info
    var repoInfo = response.getContentText().match(/\"repo-list\"\>([\s\S]*)\<\/ol\>/)[0];

    var condition = {
      name: /repo-list-name\"\>\n.*\"\>/g,
      description: /\"repo\-list\-description\"\>\n.*\n/g,
      star: /.*stars/g
    };

    var formmater = {
      name: function(_name) {
        return _name
          .split('href')[1]
          .replace(/\=/g, '')
          .replace(/\"/g, '')
          .replace(/\>/g, '');
      },

      description: function(_description) {
        return _description
          .split('\n')[1];
      },

      star: function(_star) {
        return _star
          .replace(/\s/g, '')
          .replace(/\,/g, '')
          .replace(/[a-z]/g, '');
      }
    };

    var trendingValues = {};
    var contents = config.contents || [];
    for (var i = 0; i < contents.length; i++) {
      var content = contents[i];
      var values = repoInfo.match(condition[content]);
      for (var j = 0; j < values.length; j++) {
        values[j] = formmater[content](values[j]);
      }
      trendingValues[content] = values;
    }

    return trendingValues;
  },

  _convert: function(trendingValues) {
    var converter = {
      name: function(_name) {
        return '\<h3\>\<a href\=\"https\:\/\/github.com\/' + _name + '\"\>' + _name +  '\<\/a\>\<\/h3\>';
      },

      description: function(_description) {
        return '\<p\>' + _description + '\<\/p\>';
      },

      star: function(_star) {
        return '\<p\>' +  _star + ' stars\<\/p\>';
      }

    };

    for (var key in trendingValues) {
      var values = trendingValues[key];
      for (var i = 0; i < values.length; i++) {
        values[i] = converter[key](values[i]);
      }
    }

    return trendingValues;
  },


  sendEmail: function() {
    var trendingValues = this._getTrendingValues(config.url);
    trendingValues = this._convert(trendingValues);

    var text = '';
    for (var i = 0;; i++) {
      if (!trendingValues.name[i]) {
        break;
      }

      text += trendingValues.name[i] + '\n';
      text += trendingValues.star[i] + '\n';
      text += trendingValues.description[i] + '\n\<b\>\n';
    }

    Logger.log(text);
    if (config.email) {
      GmailApp.sendEmail(config.email, utils.getTime(), '', {
        htmlBody: text
      });
    }

    return this;
  }

};

var utils = {
  getTime: function() {
    var DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thurs', 'Fri', 'Sat'];

    var d = new Date();
    var year  = d.getFullYear();
    var month = d.getMonth() + 1;
    var date  = d.getDate();
    var day   = DAY[d.getDay()];
    var hours = d.getHours();

    return year + '/' + month + '/' + date + '/' + day;
  }
}
