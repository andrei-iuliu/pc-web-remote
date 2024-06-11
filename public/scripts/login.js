const urlParams = new URLSearchParams(window.location.search);
const error = urlParams.get('error');
const success = urlParams.get('success');
if (error) {
    alert(error);
}
if (success) {
    alert(success);
}
