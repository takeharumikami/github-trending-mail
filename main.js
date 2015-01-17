var config = {

  //email: 'your email address',

  // Select languages
  languages: {
    All: [
      'daily',
      'weekly',
      'monthly',
    ],
    javascript: [
      'daily'
    ],
    go: [
      'daily'
    ],
    python: [
      'daily'
    ]
  },

  url: 'https://github.com/trending',
  title: 'Github Trending',
  contents: ['name', 'language', 'star', 'description'],
  repoListCount: 25
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
      star: /.*stars/g,
      language: /\"repo-list-meta\"\>\n.*\n/g,
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
      },

      language: function(_language) {
        return _language
          .split('\n')[1]
          .replace(/\s/g, '');
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
        return _star + ' stars\<\/p\>';
      },

      language: function(_language) {
        if (!_language) {
          return '\<p\>';
        }
        return '\<p\>' +  _language + ': ';
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

    trendingValues = this._convertHtml(trendingValues);

    var paragraphTitles = [];
    for (var language in languages) {
      var timespan = languages[language];
      for (var i = 0; i < timespan.length; i++) {
        paragraphTitles.push('\<h1\>' + language + ': ' + timespan[i] + '\<\/h1\>');
      }
    }

    var text = '';
    L: for (var i = 0;; i++) {
      if (i % config.repoListCount === 0) {
        text += paragraphTitles[i / config.repoListCount];
      }

      for (var j = 0; j < contents.length; j++) {
        var content = contents[j];
        if (content === 'language') {
          text += trendingValues[content][i] + '\n';
          continue;
        }

        if (!trendingValues[content] || !trendingValues[content][i]) {
          break L;
        }

        text += trendingValues[content][i] + '\n';
      }
    }

    var title = config.title + ' ' + utils.getTime();
    if (config.email) {
      GmailApp.sendEmail(config.email, title, '', {
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
