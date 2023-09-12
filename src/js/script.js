/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  'use strict';

const select = {
  templateOf: {
    menuProduct: "#template-menu-product",
    },
    containerOf: {
      menu: '#product-list',
      cart: '#cart',
    },
    all: {
      menuProducts: '#product-list > .product',
      menuProductsActive: '#product-list > .product.active',
      formInputs: 'input, select',
    },
    menuProduct: {
      clickable: '.product__header',
      form: '.product__order',
      priceElem: '.product__total-price .price',
      imageWrapper: '.product__images',
      amountWidget: '.widget-amount',
      cartButton: '[href="#add-to-cart"]',
    },
    widgets: {
      amount: {
        input: 'input[name="amount"]',
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
  };

  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
  };

  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 0,
      defaultMax: 10,
    }
  };

  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
  };

  class Product {
    constructor(id, data) {
      const thisProduct = this;
      thisProduct.id = id;
      thisProduct.data = data;
      thisProduct.renderInMenu();
      thisProduct.getElements();
      thisProduct.initAccordion();
      thisProduct.initOrderForm();
      thisProduct.processOrder();
      console.log('new Product:', thisProduct);
    }
  
    renderInMenu() {
      const thisProduct = this;
      /* generate html based on template */
      const generatedHTML = templates.menuProduct(thisProduct.data);
      /* create element using utils.createElementFromHTML */
      thisProduct.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      const menuContainer = document.querySelector(select.containerOf.menu);
      /* add element to menu */
      menuContainer.appendChild(thisProduct.element);
    }

    getElements(){
      const thisProduct = this;
    
      thisProduct.accordionTrigger = thisProduct.element.querySelector(select.menuProduct.clickable);
      thisProduct.form = thisProduct.element.querySelector(select.menuProduct.form);
      thisProduct.formInputs = thisProduct.form.querySelectorAll(select.all.formInputs);
      thisProduct.cartButton = thisProduct.element.querySelector(select.menuProduct.cartButton);
      thisProduct.priceElem = thisProduct.element.querySelector(select.menuProduct.priceElem);
    }
   
  
    initAccordion() {
      const thisProduct = this;
  
      /* find the clickable trigger (the element that should react to clicking) */
      const clickableTrigger = thisProduct.element.querySelector('.product__name'); // eslint-disable-line no-unused-vars
  
      /* START: add an event listener to the clickable trigger on the click event */
      thisProduct.accordionTrigger.addEventListener('click', function (event) {
        /* prevent the default action for the click event */
        event.preventDefault();
  
        /* find the active product (product that has the active class) */
        const activeProduct = document.querySelector(select.all.menuProductsActive);
  
        /* if there is an active product and it's not thisProduct.element, remove the active class from it */
        if (activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }
  
        /* toggle the active class on thisProduct.element */
        thisProduct.element.classList.toggle(classNames.menuProduct.wrapperActive);
      });
    }
    initOrderForm() {
      const thisProduct = this;
      console.log('initOrderForm method');
      thisProduct.form.addEventListener('submit', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
      
      for(let input of thisProduct.formInputs){
        input.addEventListener('change', function(){
          thisProduct.processOrder();
        });
      }
      
      thisProduct.cartButton.addEventListener('click', function(event){
        event.preventDefault();
        thisProduct.processOrder();
      });
    }
    processOrder() {
      const thisProduct = this;
    
      // Convert form data to an object structure, e.g., { sauce: ['tomato'], toppings: ['olives', 'redPeppers'] }
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log('formData', formData);
    
      // Set the price to the default price
      let price = thisProduct.data.price;
    
      // For every category (param)...
      for (let paramId in thisProduct.data.params) {
        // Determine param value, e.g., paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
        const param = thisProduct.data.params[paramId];
        console.log(paramId, param);
    
        // For every option in this category
        for (let optionId in param.options) {
          // Determine option value, e.g., optionId = 'olives', option = { label: 'Olives', price: 2, default: true }
          const option = param.options[optionId];
          console.log(optionId, option);
    
          // Check if the option is selected in the form data
          const optionSelected = formData[paramId] && formData[paramId].includes(optionId);
    
          // If the option is selected and not the default option, increase the price by the option's price
          if (optionSelected && !option.default) {
            price += option.price;
          }
    
          // If the option is not selected and is the default option, decrease the price by the option's price
          if (!optionSelected && option.default) {
            price -= option.price;
          }
        }
      }
    
      // Update the calculated price in the HTML
      thisProduct.priceElem.innerHTML = price;
    }
    }
  

  const app = { // eslint-disable-line no-unused-vars
    initMenu: function(){
      const thisApp = this;
      console.log('thisApp.data:', thisApp.data);
      for(let productData in thisApp.data.products){
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function(){
      const thisApp = this;

      thisApp.data = dataSource;

    },

    init: function(){
      const thisApp = this;
      console.log('*** App starting ***');
      console.log('thisApp:', thisApp);
      console.log('classNames:', classNames);
      console.log('settings:', settings);
      console.log('templates:', templates);
      thisApp.initData();
      thisApp.initMenu();
    },
  };

 
  app.init();
}