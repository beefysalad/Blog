const password = document.querySelector('#password')
const cpassword = document.querySelector('#repassword')

if(cpassword){
    cpassword.addEventListener('keyup',(e)=>{
        if(cpassword.value==password.value){
            cpassword.setCustomValidity('')
        }
        else{
            cpassword.setCustomValidity('Passwords do not match')
        }
            cpassword.reportValidity()
        })
}

// if(rep){
//     rep.addEventListener('keyup',(e)=>{
//         if(rep.value==password.value){
//             rep.setCustomValidity('')
//         }else{
//             rep.setCustomValidity('Passwords do not match')
//         }
//         rep.reportValidity()
//     })
// }
