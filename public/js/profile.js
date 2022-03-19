function imageClick(){
    document.querySelector('#img').click()
}
const image = document.querySelector('#img')
$(function () {
    $("#img").change(function () {
        readURL(this);
        console.log(readURL(this))
    });
});
function readURL(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
            //alert(e.target.result);
            $('.imagez').attr('src', e.target.result);
        }   
        reader.readAsDataURL(input.files[0]);
    }
}