# ndkit
Enumerate library of javascript 


# nd.webkit



# nd.mvmp
Context based script


## Concept
```javascript

<div id="render-placeholder"></div>

<template nd-viewmodel="List">
	<List>
		<header>
			<b>{{title}} Items total</b>
			<var>{{items.length}}</var>
		</header>
		<ul nd-childmodel="Item" nd-childprop="items"></ul>
		<footer>
			<a class="add-new-item"></a>
		</footer>
	</List>
</template>

<template nd-viewmodel="Item">
	<Item>
		<b>{{data.title}}</b>
		<a class="remove-item-action"></a>
	</Item>
</template>

<script>
	nd.ViewModel("List",function(model){
		model.node(".add-new-item").on("click",function(){
			model.update("items",function(items){
				items.push({title:"untitle"});
			});
		});
		
		model.change("items",function(items){
			model.node("ul").toggleClass("hidden",!!items);
		});
	});

	nd.ViewModel("Item",function(instance){
		model.node(".remove-item-action").on("click",function(){
			model.remove();
		});
	});
	
	var datacontext = new nd.DataContext({
		title:"Nody2 list",
		items:[
			{title:"item1"},
			{title:"item2"}
		]
	});
	
	var Presentor = new nd.DataPresentor("#render-placeholder",datacontext);
</script>

```
