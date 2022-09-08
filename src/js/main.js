// Pobrać textarea
// Monitorować wpisywanie tekstu (event keyup)
// let scHeight = e.target.scrollHeight będzie wielkością obszaru
// textarea.style.height = Number(scHeight)

const container = document.querySelector('.container')
const send = document.querySelector('.comment-box__footer__submit__btn')

let data1
let user1
let comments

const addBox = () => {}

const fetchData = () => {
	fetch('data.json')
		.then(response => response.json())
		.then(data => {
			data1 = data
			user1 = data1.currentUser.username
			comments = data1.comments
			getComments(comments)
		})
}

const getComments = comments => {
	comments.forEach(element => {
		const content = element.content
		const createdDate = element.createdAt
		const id = element.id
		const score = element.score
		const replies = element.replies
		const user = element.user
		const image = user.image.png
		const name = user.username

		if (replies.length > 0) {
			console.log('Create reply')
		}
		const boxDiv = document.createElement('div')
		const headerPart = createHeaderPart(image, name, createdDate)
		const textPart = createTextPart(content)
		const editPart = createEditPart(score)
		boxDiv.classList.add('comment-box')
		container.appendChild(boxDiv)
		boxDiv.appendChild(headerPart)
		boxDiv.appendChild(textPart)
		boxDiv.appendChild(editPart)
	})
}

function createHeaderPart(imgSrc, name, update) {
	const headerDiv = document.createElement('div')
	headerDiv.classList.add('comment-box__header')
	const img = document.createElement('img')
	img.src = imgSrc
	img.alt = 'Post author'
	img.classList.add('comment-box__header__image')
	const nameDiv = document.createElement('div')
	nameDiv.classList.add('comment-box__header__name')
	nameDiv.textContent = name
	headerDiv.append(img)
	headerDiv.append(nameDiv)
	if (user1 === name) {
		const ownerDiv = document.createElement('div')
		ownerDiv.classList.add('comment-box__header__owner')
		ownerDiv.textContent = 'you'
		headerDiv.append(ownerDiv)
	}
	const createdDiv = document.createElement('div')
	createdDiv.classList.add('comment-box__header__update')
	createdDiv.textContent = update
	headerDiv.append(createdDiv)
	return headerDiv
}

function createTextPart(content) {
	const pBox = document.createElement('p')
	pBox.classList.add('comment-box__text')
	const spanMain = document.createElement('span')
	spanMain.textContent = content
	pBox.appendChild(spanMain)
	return pBox
}

function createEditPart(score, name) {
	const editPart = document.createElement('div')
	editPart.classList.add('comment-box__edit')
	const voteDiv = document.createElement('div')
	voteDiv.classList.add('comment-box__edit__vote')
	const votePlus = document.createElement('button')
	votePlus.classList.add('comment-box__edit__vote--plus')
	const voteStats = document.createElement('p')
	voteStats.classList.add('comment-box__edit__vote__stats')
	voteStats.textContent = score
	const voteMinus = document.createElement('button')
	voteMinus.classList.add('comment-box__edit__vote--minus')
	if (user1 === name) {
		const manageDiv = document.createElement('div')
		manageDiv.classList.add('comment-box__edit__manage')
		const delBtn = document.createElement('button')
		delBtn.classList.add('comment-box__edit__manage__item')
		delBtn.classList.add('comment-box__edit__manage__item--delete')
		const delIcon = document.createElement('div')
		delIcon.classList.add('comment-icon')
		delIcon.classList.add('comment-box__edit__manage__item--delete__icon')
		const delText = document.createElement('p')
		delText.classList.add('comment-box__edit__manage__item--delete__text')
		delText.textContent = 'DELETE'
		const editBtn = document.createElement('button')
		editBtn.classList.add('comment-box__edit__manage__item')
		editBtn.classList.add('comment-box__edit__manage__item--edit')
		const editIcon = document.createElement('div')
		editIcon.classList.add('comment-icon')
		editIcon.classList.add('comment-box__edit__manage__item--edit__icon')
		const editText = document.createElement('p')
		editText.classList.add('comment-box__edit__manage__item--edit__text')
		editText.textContent = 'EDIT'
		editPart.append(voteDiv, manageDiv)
		manageDiv.append(delBtn, editBtn)
		delBtn.append(delIcon, delText)
		editBtn.append(editIcon, editText)
	} else {
		const replyButton = document.createElement('button')
		replyButton.classList.add('comment-box__edit__reply')
		const replyIcon = document.createElement('div')
		replyIcon.classList.add('comment-icon')
		replyIcon.classList.add('comment-box__edit__reply__icon')
		const replyText = document.createElement('p')
		replyText.classList.add('comment-box__edit__reply__text')
		replyText.textContent = 'Reply'
		editPart.append(voteDiv, replyButton)
		replyButton.append(replyIcon, replyText)
	}
	voteDiv.append(votePlus, voteStats, voteMinus)

	return editPart
}

send.addEventListener('click', addBox)
document.addEventListener('DOMContentLoaded', fetchData)
