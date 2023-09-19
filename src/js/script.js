/* global Handlebars, utils, dataSource */ // eslint-disable-line no-unused-vars

{
  ("use strict");

  const select = {
    templateOf: {
      menuProduct: '#template-menu-product',
      cartProduct: '#template-cart-product', // CODE ADDED
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
        input: 'input.amount', // CODE CHANGED
        linkDecrease: 'a[href="#less"]',
        linkIncrease: 'a[href="#more"]',
      },
    },
    // CODE ADDED START
    cart: {
      productList: '.cart__order-summary',
      toggleTrigger: '.cart__summary',
      totalNumber: `.cart__total-number`,
      totalPrice: '.cart__total-price strong, .cart__order-total .cart__order-price-sum strong',
      subtotalPrice: '.cart__order-subtotal .cart__order-price-sum strong',
      deliveryFee: '.cart__order-delivery .cart__order-price-sum strong',
      form: '.cart__order',
      formSubmit: '.cart__order [type="submit"]',
      phone: '[name="phone"]',
      address: '[name="address"]',
    },
    cartProduct: {
      amountWidget: '.widget-amount',
      price: '.cart__product-price',
      edit: '[href="#edit"]',
      remove: '[href="#remove"]',
    },
    // CODE ADDED END
  };
  
  const classNames = {
    menuProduct: {
      wrapperActive: 'active',
      imageVisible: 'active',
    },
    // CODE ADDED START
    cart: {
      wrapperActive: 'active',
    },
    // CODE ADDED END
  };
  
  const settings = {
    amountWidget: {
      defaultValue: 1,
      defaultMin: 1,
      defaultMax: 9,
    }, // CODE CHANGED
    // CODE ADDED START
    cart: {
      defaultDeliveryFee: 20,
    },
    // CODE ADDED END
  };
  
  const templates = {
    menuProduct: Handlebars.compile(document.querySelector(select.templateOf.menuProduct).innerHTML),
    // CODE ADDED START
    cartProduct: Handlebars.compile(document.querySelector(select.templateOf.cartProduct).innerHTML),
    // CODE ADDED END
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
      thisProduct.initAmountWidget();
      thisProduct.processOrder();
      console.log("new Product:", thisProduct);
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

    getElements() {
      const thisProduct = this;

      thisProduct.accordionTrigger = thisProduct.element.querySelector(
        select.menuProduct.clickable
      );
      thisProduct.form = thisProduct.element.querySelector(
        select.menuProduct.form
      );
      thisProduct.formInputs = thisProduct.form.querySelectorAll(
        select.all.formInputs
      );
      thisProduct.cartButton = thisProduct.element.querySelector(
        select.menuProduct.cartButton
      );
      thisProduct.priceElem = thisProduct.element.querySelector(
        select.menuProduct.priceElem
      );
      thisProduct.imageWrapper = thisProduct.element.querySelector(
        select.menuProduct.imageWrapper
      );
      thisProduct.amountWidgetElem = thisProduct.element.querySelector(
        select.menuProduct.amountWidget
      );

    }

    initAccordion() {
      const thisProduct = this;

      /* find the clickable trigger (the element that should react to clicking) */

      /* START: add an event listener to the clickable trigger on the click event */
      thisProduct.accordionTrigger.addEventListener("click", function (event) {
        /* prevent the default action for the click event */
        event.preventDefault();

        /* find the active product (product that has the active class) */
        const activeProduct = document.querySelector(
          select.all.menuProductsActive
        );

        /* if there is an active product and it's not thisProduct.element, remove the active class from it */
        if (activeProduct && activeProduct !== thisProduct.element) {
          activeProduct.classList.remove(classNames.menuProduct.wrapperActive);
        }

        /* toggle the active class on thisProduct.element */
        thisProduct.element.classList.toggle(
          classNames.menuProduct.wrapperActive
        );
      });
    }
    initOrderForm() {
      const thisProduct = this;
      console.log("initOrderForm method");
      thisProduct.form.addEventListener("submit", function (event) {
        event.preventDefault();
        thisProduct.processOrder();
      });

      for (let input of thisProduct.formInputs) {
        input.addEventListener("change", function () {
          thisProduct.processOrder();
        });
      }

      thisProduct.cartButton.addEventListener("click", function (event) {
        event.preventDefault();
        thisProduct.processOrder();
        thisProduct.addToCart();
      });
    }
    processOrder() {
      const thisProduct = this;
      if (thisProduct.amountWidget && thisProduct.amountWidget.input){
      // Convert form data to an object structure, e.g., { sauce: ['tomato'], toppings: ['olives', 'redPeppers'] }
      const formData = utils.serializeFormToObject(thisProduct.form);
      console.log("formData", formData);

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
          const optionSelected =
            formData[paramId] && formData[paramId].includes(optionId);

          // Find the corresponding image element
          const imageElement = thisProduct.imageWrapper.querySelector(
            `.${paramId}-${optionId}`
          );

          if (imageElement) {
            // If the image element exists, check if the option is selected
            if (optionSelected) {
              // If the option is selected, add the 'active' class to the image
              imageElement.classList.add(classNames.menuProduct.imageVisible);
            } else {
              // If the option is not selected, remove the 'active' class from the image
              imageElement.classList.remove(
                classNames.menuProduct.imageVisible
              );
            }
          }

          // Calculate the price based on selected options
          if (optionSelected && !option.default) {
            price += option.price;
          }
          if (!optionSelected && option.default) {
            price -= option.price;
          }
        }
      }
      const totalPrice = price * thisProduct.amountWidget.value;
      // Update the calculated price in the HTML
      
      thisProduct.priceSingle = price;
      thisProduct.priceElem.innerHTML = totalPrice;
      
    }
  }
    initAmountWidget() {
      const thisProduct = this;
      thisProduct.amountWidgetElem.addEventListener("updated", function () {
        thisProduct.processOrder();
      });

      thisProduct.amountWidget = new AmountWidget(thisProduct.amountWidgetElem);
    }

    addToCart() {
      const thisProduct = this;
      const productSummary = thisProduct.prepareCartProduct();
      app.cart.add(productSummary);
    }

    prepareCartProduct() {
      const thisProduct = this;
    
      // Calculate the total price based on priceSingle and quantity
      const totalProductPrice = thisProduct.priceSingle * thisProduct.amountWidget.value;
    
      const productSummary = {
        id: thisProduct.id,
        name: thisProduct.data.name,
        amount: thisProduct.amountWidget.value,
        priceSingle: thisProduct.priceSingle,
        price: totalProductPrice,
        params: this.prepareCartProductParams(),
      };
    
      console.log('adding product to cart', productSummary);
      return productSummary;
    }

    prepareCartProductParams() {
      const thisProduct = this;

  const formData = utils.serializeFormToObject(thisProduct.form);
  const params = {}; // Declare params as an object, not an array

  // For every category (param)...
  for (let paramId in thisProduct.data.params) {
    // Determine param value, e.g., paramId = 'toppings', param = { label: 'Toppings', type: 'checkboxes'... }
    const param = thisProduct.data.params[paramId];

    // Create category param in params const eg. params = { ingredients: { name: 'Ingredients', options: {}}}
    params[paramId] = {
      label: param.label,
      options: {}
    };

    // For every option in this category
    for (let optionId in param.options) {
      const option = param.options[optionId];
      const optionSelected = formData[paramId] && formData[paramId].includes(optionId);

      if (optionSelected) {
        // Option is selected, add it to the options object
        params[paramId].options[optionId] = option.label;
      }
    }
  }

  // Now assign the params object to the product summary
  thisProduct.params = params;

  return params;
      }
      
      
      
    }

    
  

  class AmountWidget {
    constructor(element) {
      const thisWidget = this;
      thisWidget.getElements(element);
      thisWidget.setValue(thisWidget.input.value);
      thisWidget.initActions();
      thisWidget.previousValue = thisWidget.input.value || settings.amountWidget.defaultValue;
      console.log("AmountWidget:", thisWidget);
      console.log("constructor arguments", element);
    }
    getElements(element) {
      const thisWidget = this;

      thisWidget.element = element;
      thisWidget.input = thisWidget.element.querySelector(
        select.widgets.amount.input
      );
      thisWidget.linkDecrease = thisWidget.element.querySelector(
        select.widgets.amount.linkDecrease
      );
      thisWidget.linkIncrease = thisWidget.element.querySelector(
        select.widgets.amount.linkIncrease
      );
    }
    setValue(value) {
      const thisWidget = this;
      const newValue = parseInt(value);
      const min = settings.amountWidget.defaultMin;
      const max = settings.amountWidget.defaultMax;
    
      /*TODO: Add validation */
      if (
        thisWidget.input &&
        thisWidget.value !== newValue &&
        !isNaN(newValue) &&
        newValue >= min &&
        newValue <= max
      ) {
        thisWidget.value = newValue;
        thisWidget.previousValue = newValue; 
      } else {
        /* If 'input' doesn't exist or 'value' is invalid, set the default value */
        thisWidget.value = thisWidget.previousValue || settings.amountWidget.defaultValue;
      }
      thisWidget.announce();
    
      thisWidget.input.value = thisWidget.value;
    }
    initActions() {
      const thisWidget = this;

      thisWidget.input.addEventListener("change", () => {
        thisWidget.setValue(thisWidget.input.value);
      });

      thisWidget.linkDecrease.addEventListener("click", (event) => {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value - 1);
      });

      thisWidget.linkIncrease.addEventListener("click", (event) => {
        event.preventDefault();
        thisWidget.setValue(thisWidget.value + 1);
      });
    }
    announce() {
      const thisWidget = this;

      const event = new Event("updated");
      thisWidget.element.dispatchEvent(event);
    }
  }

  class Cart{
    constructor(element){
      const thisCart = this;

      thisCart.products = [];

      thisCart.getElements(element);
      thisCart.initActions();
     
      console.log('new Cart', thisCart);
    }

     
    initActions() {
      const thisCart = this;
    
      thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
        event.preventDefault();
        thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
      });
    }

    getElements(element){
      const thisCart = this;

      thisCart.dom = {};

      thisCart.dom.wrapper = element;
      thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    }

    add(menuProduct){
      //const thisCart = this;
      const thisCart = this;
      console.log('adding product', menuProduct);

      
      /* generate html based on template */
      const generatedHTML = templates.cartProduct(menuProduct);
      /* create element using utils.createElementFromHTML */
      thisCart.element = utils.createDOMFromHTML(generatedHTML);
      /* find menu container */
      thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
      /* add element to menu */
      thisCart.dom.productList.appendChild(thisCart.element);
    }
  }
  const app = {
    // eslint-disable-line no-unused-vars
    initMenu: function () {
      const thisApp = this;
      console.log("thisApp.data:", thisApp.data);
      for (let productData in thisApp.data.products) {
        new Product(productData, thisApp.data.products[productData]);
      }
    },
    initData: function () {
      const thisApp = this;

      thisApp.data = dataSource;
    },

initCart: function(){
  const thisApp = this;

  const cartElem = document.querySelector(select.containerOf.cart);
  thisApp.cart = new Cart(cartElem);
},

    init: function () {
      const thisApp = this;
      console.log("*** App starting ***");
      console.log("thisApp:", thisApp);
      console.log("classNames:", classNames);
      console.log("settings:", settings);
      console.log("templates:", templates);
      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },
  };

  app.init();
}