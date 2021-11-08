let date = new Date();
let year = date.getFullYear();
let month = date.getMonth() + 1;
let todayDate = String(date.getDate()).padStart(2, '0');
let currentDate = year + '-' + month + '-' + todayDate;

const config = {
    headers: {
        'content-type': 'application/json'
    }
}

document.addEventListener('click', function (event) {

    if (event.target.classList.contains('edit-me')) {
        let userInput = prompt("Enter your new todo name");

        if (userInput) {
            let body = JSON.stringify({
                _id: event.target.getAttribute("data-id"),
                message: userInput
            });

            console.log(body);

            axios.patch('/edit-item', body, config)
                .then(function (response) {
                    if (response.status == 200) {
                        event.target.parentElement.parentElement.parentElement.querySelector('.item-text').innerHTML = userInput;
                    } else {
                        alert("An error occured");
                    }
                })
                .catch(function (err) {
                    alert("An error occured");
                })
        }
    }

    if (event.target.classList.contains('delete-me')) {

        if (confirm("Do you want to delete the item")) {
            let body = JSON.stringify({
                _id: event.target.getAttribute("data-id"),
            });

            axios.post('/delete-item', body, config)
                .then(function (response) {
                    if (response.status == 200) {
                        event.target.parentElement.parentElement.parentElement.remove();
                    } else {
                        alert("An error occured");
                    }
                })
                .catch(function (err) {
                    alert("An error occured");
                })
        }
    }

});

document.querySelector('.date-header').innerHTML = `Date: ${todos[0].date}`;

var currDate = Date.parse(currentDate);
var todoDate = Date.parse(todos[0].date);
if (todoDate < currDate) {
    const addItemForm = document.querySelector('#create_form')
    addItemForm.remove();
}

let ourHtml = todos.map(function (todo) {
    if (currentDate === todo.date) {
        return `<li class="list-group-item">
        <label>
            <p class="item-text">${todo.todo}</p>
            <span class="span-all-three">
                <button data-id="${todo._id}" class="edit-me">✏</button>
                <button data-id="${todo._id}" class="delete-me">🗑</button>
            </span>
        </label>
    </li>`
    } else {
        return `<li class="list-group-item">
        <label>
            <p class="item-text">${todo.todo}</p>
            <span class="span-all-three">
                <button data-id="${todo._id}" class="edit-me" disabled>✏</button>
                <button data-id="${todo._id}" class="delete-me" disabled>🗑</button>
            </span>
        </label>
    </li>`
    }
}).join('')

document.getElementById("item_list").insertAdjacentHTML('beforeend', ourHtml);