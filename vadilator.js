

function Validator(options) {
    function getParent(element,selector){
        while(element.parentElement){
            if(element.parentElement.matches(selector)){
                return element.parentElement
            }
            element = element.parentElement
        }
    }
    var selectorRules = {}
    
    // ham thuc hien validate
    function Validate(inputElement,rule){ 
        var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
        var errorMessage
        var rules = selectorRules[rule.selector]
        

        for(var i = 0; i < rules.length; i++){
            switch(inputElement.type){
                case 'radio':
                case 'checkbox':
                    errorMessage = rules[i](
                        formElement.querySelector(rule.selector + ':checked')
                    )
                    break
                default:
                    errorMessage = rules[i](inputElement.value)

            }
            if(errorMessage) break
        }

        if(errorMessage) {
            errorElement.textContent = errorMessage
            getParent(inputElement,options.formGroupSelector).classList.add('invalid')
        }else {
            errorElement.textContent = ''
            getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
        }

        return !errorMessage
    }
    // lay element cua form can validate 
    var formElement = document.querySelector(options.form)
    
    if(formElement) {
        //  bo hanh vi mac dinh cua form
        formElement.onsubmit = function(e){
            e.preventDefault()
            var isFormValid = true 

            // lap qua tung rule va validate
            options.rules.forEach(rule => {
                var inputElement =formElement.querySelector(rule.selector)
                var isValid = Validate(inputElement,rule) 
                if(!isValid){
                    isFormValid = false
                }
            })
            

            if(isFormValid){
                if(typeof options.onsubmit === 'function'){
                    var enableInputs = formElement.querySelectorAll('[name]:not([disabled])')
                    var formValues = Array.from(enableInputs).reduce((values,input)=>{
                        switch(input.type) {
                            case 'radio':
                                values[input.name] = formElement.querySelector('input[name = "' + input.name + '"]:checked').value
                                break
                            case 'checkbox':
                                if(!input.matches(':checked')){
                                    values[input.name] = ''
                                    return values
                                } 
                                if(!Array.isArray(values[input.name])){
                                    values[input.name] = []
                                }
                                values[input.name].push(input.value)
                                break
                            case 'file':
                                values[input.name] = input.files
                                break 
                            default:
                                values[input.name] = input.value
                        }
                        return values
                    },{})
                    options.onsubmit(formValues)
                }else{
                    formElement.submit()
                }
            }
        }

        // lặp qua mỗi rule và xử lý
        options.rules.forEach(rule => {
            // luu lai cac rule cho moi input
            
            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            }else{
                selectorRules[rule.selector] = [rule.test]
            }
            

            var inputElements =formElement.querySelectorAll(rule.selector)
            Array.from(inputElements).forEach(inputElement => {
                inputElement.onblur = function() { 
                    Validate(inputElement,rule) 
                }

                // xu ly truong hop nguoi dung nhap vao input
                inputElement.oninput = function() {
                    var errorElement = getParent(inputElement,options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.textContent = ''
                    getParent(inputElement,options.formGroupSelector).classList.remove('invalid')
                }
            })   
        })
        
    }
}

// dinh nghia rules 
Validator.isRequired = function(selector,message){
    return {
        selector: selector, 
        test:function(value){
            return value  ? undefined : message || 'Vui lòng nhập trường này'
        }
    }
}

Validator.isEmail = function(selector,message){
     return {
        selector: selector, 
        test:function(value){
            var regex= /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message || 'Trường này phải là email'
            
        }   
    }
}
Validator.minLength= function(selector,min,message){
    return {
        selector: selector, 
        test:function(value){
            return value.trim().length >= min ? undefined : message || `Vui lòng nhập ít nhất ${min} kí tự`
        }
    }
}

Validator.isConfirmed = function(selector,getConfirmValue,message){
    return {
        selector: selector,
        test(value){
            return value === getConfirmValue() ? undefined :message || 'Giá trị nhập vào không chính xác'
        }
    }
}