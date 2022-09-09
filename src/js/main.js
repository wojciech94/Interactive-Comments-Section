// Pobrać textarea
// Monitorować wpisywanie tekstu (event keyup)
// let scHeight = e.target.scrollHeight będzie wielkością obszaru
// textarea.style.height = Number(scHeight)

const container = document.querySelector('.container')
let sendBtn = document.querySelector('.comment-box__footer__submit__btn')

let data1
let user1
let comments

const fetchData = () => {
	fetch('data.json')
		.then(response => response.json())
		.then(data => {
			data1 = data
			user1 = data1.currentUser
			comments = data1.comments
			getComments(comments)
			createAddCommentPart()
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
		createComment(image, name, createdDate, content, score)
	})
}

function createComment(image, name, date, content, score = 0) {
	const boxDiv = document.createElement('div')
	const headerPart = createHeaderPart(image, name, date)
	const textPart = createTextPart(content)
	const editPart = createEditPart(score, name)
	boxDiv.classList.add('comment-box')
	boxDiv.appendChild(headerPart)
	boxDiv.appendChild(textPart)
	boxDiv.appendChild(editPart)
	container.appendChild(boxDiv)
	return boxDiv
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
	if (user1.name === name) {
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
	if (user1.username === name) {
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
		delText.textContent = 'Delete'
		const editBtn = document.createElement('button')
		editBtn.classList.add('comment-box__edit__manage__item')
		editBtn.classList.add('comment-box__edit__manage__item--edit')
		const editIcon = document.createElement('div')
		editIcon.classList.add('comment-icon')
		editIcon.classList.add('comment-box__edit__manage__item--edit__icon')
		const editText = document.createElement('p')
		editText.classList.add('comment-box__edit__manage__item--edit__text')
		editText.textContent = 'Edit'
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

const pushComment = () => {
	const now = new Date().getTime()
	const input = document.querySelector('.comment-box__text__input')
	const content = input.value
	input.value = ''
	const addCommentBox = document.querySelector('.add-comment')
	const newComment = createComment(user1.image.png, user1.username, now, content, 0)
	container.insertBefore(newComment, addCommentBox)
}

const createAddCommentPart = () => {
	const commentBox = document.createElement('div')
	commentBox.classList.add('comment-box')
	commentBox.classList.add('add-comment')
	//comment-box ponizej zamienic na add-comment (+w cssie)
	const commentText = document.createElement('div')
	commentText.classList.add('comment-box__text')
	const commentFooter = document.createElement('div')
	const textArea = document.createElement('textarea')
	textArea.name = 'comment'
	textArea.id = '0'
	textArea.placeholder = 'Add a comment...'
	textArea.classList.add('comment-box__text__input')
	commentFooter.classList.add('comment-box__footer')
	const footerImg = document.createElement('img')
	footerImg.classList.add('comment-box__footer__image')
	footerImg.alt = 'Post owner'
	footerImg.src = user1.image.png
	const submitDiv = document.createElement('div')
	submitDiv.classList.add('comment-box__footer__submit')
	const submitBtn = document.createElement('button')
	submitBtn.classList.add('comment-box__footer__submit__btn')
	submitBtn.textContent = 'SEND'

	container.append(commentBox)
	commentBox.append(commentText, commentFooter)
	commentText.append(textArea)
	commentFooter.append(footerImg, submitDiv)
	submitDiv.append(submitBtn)

	sendBtn = submitBtn
	sendBtn.addEventListener('click', pushComment)
}

// send.addEventListener('click', addBox)
document.addEventListener('DOMContentLoaded', fetchData)
