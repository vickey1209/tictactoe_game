var clientId;
var gameId;
var socket;
var symbol;


const create = document.querySelector(".createbtn")
create.disabled = true
const join = document.querySelector('.joinbtn')
join.disabled = true
join.addEventListener('click', () => {
    socket.send(JSON.stringify({
        'tag': 'join',
        'clientId': clientId,
        'gameId': gameId
    }))
})
const cells = document.querySelectorAll('.cell')
const board = document.querySelector('.board')
const list = document.querySelector('ul')
const sidebar = document.querySelector(".sidebar")
const connect = document.querySelector(".connectbtn")
connect.addEventListener('click', (src) => {
    socket = new WebSocket('ws://localhost:5000')
    socket.onmessage = onMessage
    src.target.disabled = true
})


function onMessage(msg) {
    const data = JSON.parse(msg.data)
    switch (data.tag) {
        case 'connected':
            console.log(data.clientId);
            clientId = data.clientId
            const lbl = document.createElement('label')

            lbl.innerText = data.clientId
            lbl.style.textAlign = 'center'
            sidebar.insertBefore(lbl, connect)
            create.disabled = false
            join.disabled = false
            break
        case "gamesList":
            //console.log(data.list);
            const games = data.list
            console.log(games);
            while (list.firstChild) {
                list.removeChild(list.lastChild)
            }
            games.forEach(game => {

                const li = document.createElement('li')
                li.innerText = game
                li.style.textAlign = 'center'
                list.appendChild(li)
                li.addEventListener('click', () => { gameId = game })
            })

            // when u click on connect it will give undefind gameId and when u click on game create button u will get (gameId)
            // console.log(gameId)
            break
        case 'created':
            gameId = data.gameId
            create.disabled = true
            join.disabled = true
            symbol = 'x'
            //console.log(gameId)
            break
        case 'joined':
            document.querySelector('.board').style.display = 'grid'
            symbol = data.symbol;
            if (symbol == 'x')
                board.classList.add('cross');
            else
                board.classList.add('circle');
            break;
        case 'updateBoard':
            cells.forEach(cell => {
                if (cell.classList.contains('cross'))
                    cell.classList.remove('cross')
                else if (cell.classList.contains('circle'))
                    cell.classList.remove('circle')

            })
            for (i = 0; i < 9; i++) {
                if (data.board[i] == 'x')
                    cells[i].classList.add('cross')

                else if (data.board[i] == 'o')
                    cells[i].classList.add('circle')
            }
            if (data.isTurn)
                makeMove()
            break
        case 'winner':
            alert(`the winner of the game is ${data.winner} keep it up..!`)
            break

        case 'gameDraw':
            alert('game is draw..! Play Again..!')

    }
}
function makeMove() {
    cells.forEach(cell => {
        if (!cell.classList.contains('cross') && !cell.classList.contains('circle'))
            cell.addEventListener('click', cellClicked)
    })
}

function cellClicked(src) {
    let icon
    if (symbol == 'x') {
        icon = 'cross';
    } else {
        icon = 'circle';
    }
    src.target.classList.add(icon)
    const board = [];

    console.log("check.....", src.target);

    for (let i = 0; i < 9; i++) {
        if (cells[i].classList.contains('circle'))
            board[i] = 'o';
        else if (cells[i].classList.contains('cross'))
            board[i] = 'x';
        else
            board[i] = '';
    }
    cells.forEach(cell => {
        cell.removeEventListener('click', cellClicked)
    })
    socket.send(JSON.stringify({
        'tag': 'moveMade',
        'board': board,
        'clientId': clientId,
        'gameId': gameId
    }))
}

create.addEventListener('click', () => {
    socket.send(JSON.stringify({
        'tag': 'create',
        'clientId': clientId

    }))
})