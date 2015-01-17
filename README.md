# github-trending-mail

Send email of github trending by google app script

![result.png](https://github.com/takeharumikami/github-trending-mail/blob/master/img/result.png)

## Examples

Create goole app script project on google drive.

![create.png](https://github.com/takeharumikami/github-trending-mail/blob/master/img/create.png)

Copy script and save it.

![save-script.png](https://github.com/takeharumikami/github-trending-mail/blob/master/img/save-script.png)

Edit config.

```

var config = {

  email: 'your email address',

  // Select languages
  languages: {
    All: [
      'daily',
      'weekly',
      'monthly'
    ],
    javascript: [
      'daily',
      'weekly'
    ],
    go: [
      'daily'
    ],
    python: [
      'daily'
    ]
  }

};

```

Select current project's triggers on menu.

![select-trigger.png](https://github.com/takeharumikami/github-trending-mail/blob/master/img/select-trigger.png)

Select time span to send email.

![select-trigger2.png](https://github.com/takeharumikami/github-trending-mail/blob/master/img/select-trigger2.png)
