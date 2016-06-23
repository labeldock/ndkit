# ndkit
web Enumerate library of javascript 


# nd.xkit
## Concept and goal target
```html
<div id="xrepeat-body"></div>

<template tag="custom-tag">
  <div>{{change|padLeft}}</div>
  <a class="change-action">change</a>
</template>


<script>
nd.xtag("custom-tag",{
  create:function(){
    
  },
  append:function(){
    
  },
  remove:function(){
    
  },
  event:function(){
    ".change-action:click":function(e){
      $(this).attr("class","changed");
    }
  }
});

nd.xrepeat("#xrepeat-body",data,function(datum,node){
  return nd.xmake('custom-tag',datum,node);
});

var ctag = nd.xselect('custom-tag')
ctag.get();
ctag.set("asf",'asf');
ctag.patch("asf",'asf');

var rtag = nd.xrepeat("#xrepeat-body");
rtag.get();
rtag.set([{},{}]);

nd.xfilter("padLeft",function(){
  return function(){
    
  }
})
</script>

```
