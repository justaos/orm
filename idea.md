```js
var am = new AnysolsModel();
am.connect(/*db details*/);

am.defineModel('fruit', defObj);
var Fruit = am.model('fruit');

var fruit = new Fruit();
fruit.set('name', 'test');
fruit.save();
```
