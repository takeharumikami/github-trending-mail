var config = {
  url: 'https://github.com/trending',
  contents: ['name', 'star', 'description'],

  //email: 'your email address',

  title: 'Github Trending',

  // Select languages
  languages: {
    defaults: [
      'daily',
      'weekly',
      // 'monthly',
    ],
    // javascript: [
    //   'daily'
    // ],
    // go: [
    //   'daily'
    // ],
    // python: [
    //   'daily'
    // ]
  }
};


function sendEmail() {
  service.sendEmail();
}

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

  // Convert HTML
  _convertHtml: function(trendingValues) {
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

    var contents = config.contents || [];
    for (var i = 0; i < contents.length; i++) {
      var content = contents[i];
      var values = trendingValues[content];
      for (var j = 0; j < values.length; j++) {
        values[j] = converter[content](values[j]);
      }
    }

    return trendingValues;
  },


  sendEmail: function() {
    var contents = config.contents || [];
    var languages = config.languages;

    var trendingValues = {};
    for (var i = 0; i < contents.length; i++) {
      trendingValues[contents[i]] = [];
    }

    for (var language in languages) {
      var timespan = languages[language];
      for (var i = 0; i < timespan.length; i++) {
        var url = config.url + '?l=' + language + '&since=' + timespan[i];
        if (language === 'defaults') {
          url = config.url + '?since=' + timespan[i];
        }

        var values = this._getTrendingValues(url);

        for (var j = 0; j < contents.length; j++) {
          var content = contents[j];
          trendingValues[content] = trendingValues[content].concat(values[content]);
        }
      }
    }

    Logger.log(trendingValues);

    trendingValues = this._convertHtml(trendingValues);

    var text = '';
    L: for (var i = 0;; i++) {
      for (var j = 0; j < contents.length; j++) {
        var content = contents[j];
        if (!trendingValues[content] || !trendingValues[content][i]) {
          break L;
        }

        text += trendingValues[content][i] + '\n';
      }
      text += '\<b\>\n';
    }

    var title = utils.getTime + ' ' +  config.tilte;
    if (config.email) {
      // GmailApp.sendEmail(config.email, title, '', {
      //   htmlBody: text
      // });
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