function considerSize() {
  if (window.innerWidth < 700) {
    document.body.classList.remove("sidebar-pinned");
  } else {
    document.body.classList.add("sidebar-pinned");
  }
}

window.addEventListener("resize", considerSize);
window.addEventListener("load", considerSize);


var menuData = {}
fetch("/ajax/menu.json").then(function(res){

})

function buildMenu(){

}