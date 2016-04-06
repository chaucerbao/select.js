# A Customisable Dropdown

How many times have you worked on a project where the designer customizes a dropdown, not knowing that the CSS available to style an `<option>` element is extremely limited? You then find yourself searching around for plugins that end up being large in size and require you to study the API for various options.

This plugin is tiny and it stays out of your way; just write your HTML and style your `<select>` as you normally would. The plugin will attach itself to the `<select>` element when the user first interacts with it. That also means that all `<select>` elements added in the future will automatically be supported without having to run any extra code. Just load this plugin and forget about it.

The DOM tree is simple. You can use these classes to customize your dropdown.

```html
<div class="select [select--focused]">
  <div class="select__overlay"></div>
  <select></select>
  <ol class="select__options [select__options--top]">
    <li class="select__option [select__option--selected]"></li>
  </ol>
</div>
```
