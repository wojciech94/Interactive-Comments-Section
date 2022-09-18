// Pobrać textarea
// Monitorować wpisywanie tekstu (event keyup)
// let scHeight = e.target.scrollHeight będzie wielkością obszaru
// textarea.style.height = Number(scHeight)

const container = document.querySelector('.container')
const modal = document.querySelector('.modal')
const modalCancel = document.querySelector('.modal__area__buttons__cancel')
const modalDelete = document.querySelector('.modal__area__buttons__delete')
let sendBtn = document.querySelector('.comment-box__footer__submit__btn')
let plusVotes
let minusVotes

let modalTarget

let curUsr
let nextMainId = 0
let lastId = 0
let allComments = []
let allReplies = []

class User {
	constructor(currentUser) {
		this.userName = currentUser.username ? currentUser.username : currentUser.userName
		this.image = currentUser.image.png ? currentUser.image.png : currentUser.image
	}
}

class Comment {
	constructor(comment, mainId) {
		this.id = comment.id
		this.content = comment.content
		this.createdAt = comment.createdAt
		this.score = comment.score
		this.user = new User(comment.user)
		this.replies = createReplies(comment.replies, mainId)
		this.mainId = mainId
	}
}

class Reply {
	constructor(reply, parentId) {
		this.id = reply.id
		this.content = reply.content
		this.createdAt = reply.createdAt
		this.score = reply.score
		this.user = new User(reply.user)
		this.replyingTo = reply.replyingTo
		this.parentId = parentId
	}
}

//extract and modify reply object from json
function createReplies(replies, parentId) {
	let reps = []
	replies.forEach(reply => {
		let rep = new Reply(reply, parentId)
		reps.push(rep)
	})
	return reps
}

const fetchData = () => {
	if (
		localStorage.getItem('currentUser') &&
		localStorage.getItem('allComments') &&
		localStorage.getItem('allReplies')
	) {
		getUser()
		downloadComments()
		downloadReplies()
		getComments(allComments)
		lastId = allComments.length + allReplies.length
		addCommentPart()
	} else {
		fetch('data.json')
			.then(response => response.json())
			.then(data => {
				curUsr = new User(data.currentUser)
				getComments(data.comments, true)
				lastId = allComments.length + allReplies.length
				addCommentPart()
				saveUser()
				saveComments()
				saveReplies()
			})
	}
}

function getComments(comments, pushComments = false) {
	comments.forEach((element, parentId) => {
		let newComment = new Comment(element, parentId)
		if (pushComments) {
			allComments.push(newComment)
		}
		nextMainId++

		createComment(
			newComment.user.image,
			newComment.user.userName,
			newComment.createdAt,
			newComment.content,
			newComment.id,
			newComment.score,
			parentId
		)

		if (newComment.replies.length > 0) {
			newComment.replies.forEach(reply => {
				if (pushComments) {
					allReplies.push(reply)
				}
				createComment(
					reply.user.image,
					reply.user.userName,
					reply.createdAt,
					reply.content,
					reply.id,
					reply.score,
					parentId,
					reply.replyingTo
				)
			})
		}
	})
}

//Create comment from json data or local storage
function createComment(image, name, date, content, id, score, parentId, replyTo = null) {
	const boxDiv = document.createElement('div')
	boxDiv.dataset.id = id
	const headerPart = createHeaderPart(image, name, date)
	const textPart = createTextPart(content, replyTo)
	const editPart = createEditPart(score, name, parentId)
	boxDiv.classList.add('comment-box')
	boxDiv.appendChild(headerPart)
	boxDiv.appendChild(textPart)
	boxDiv.appendChild(editPart)
	if (replyTo != null) {
		boxDiv.classList.add('comment-response')
		let bfElement = container.querySelector(`.comment-box[data-parent-id="${parentId + 1}"]`)
		boxDiv.dataset.parentId = parentId
		if (bfElement == null) {
			container.appendChild(boxDiv)
		}
	} else {
		boxDiv.dataset.mainId = parentId
		container.appendChild(boxDiv)
	}
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
	if (curUsr.userName === name) {
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

function createTextPart(content, replyTo = null) {
	const pBox = document.createElement('p')
	pBox.classList.add('comment-box__text')
	if (replyTo != null) {
		const spanReplyTo = document.createElement('span')
		spanReplyTo.textContent = '@' + replyTo + ' '
		spanReplyTo.classList.add('response-target')
		pBox.appendChild(spanReplyTo)
	}
	const spanMain = document.createElement('span')
	spanMain.classList.add('text-content')
	spanMain.textContent = content
	pBox.appendChild(spanMain)
	return pBox
}

function createEditPart(score, name, parentId) {
	const editPart = document.createElement('div')
	editPart.classList.add('comment-box__edit')
	const voteDiv = document.createElement('div')
	voteDiv.classList.add('comment-box__edit__vote')
	voteDiv.dataset.plusCount = 0
	voteDiv.dataset.minusCount = 0
	const votePlus = document.createElement('button')
	votePlus.classList.add('comment-box__edit__vote--plus')
	const voteStats = document.createElement('p')
	voteStats.classList.add('comment-box__edit__vote__stats')
	voteStats.textContent = score
	const voteMinus = document.createElement('button')
	voteMinus.classList.add('comment-box__edit__vote--minus')
	votePlus.addEventListener('click', upVote)
	voteMinus.addEventListener('click', downVote)
	if (curUsr.userName === name) {
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
		delBtn.addEventListener('click', showModal)
		editBtn.addEventListener('click', editComment)
		editText.textContent = 'Edit'
		delBtn.dataset.parentId = parentId
		editBtn.dataset.parentId = parentId
		editPart.append(voteDiv, manageDiv)
		manageDiv.append(delBtn, editBtn)
		delBtn.append(delIcon, delText)
		editBtn.append(editIcon, editText)
	} else {
		const replyButton = document.createElement('button')
		replyButton.classList.add('comment-box__edit__reply')
		replyButton.dataset.replyTarget = name
		const replyIcon = document.createElement('div')
		replyIcon.classList.add('comment-icon')
		replyIcon.classList.add('comment-box__edit__reply__icon')
		const replyText = document.createElement('p')
		replyText.classList.add('comment-box__edit__reply__text')
		replyText.textContent = 'Reply'
		replyButton.dataset.parentId = parentId
		editPart.append(voteDiv, replyButton)
		replyButton.append(replyIcon, replyText)
		replyButton.addEventListener('click', addReplyPart)
	}
	voteDiv.append(votePlus, voteStats, voteMinus)

	return editPart
}

const createAddCommentPart = () => {
	const commentBox = document.createElement('div')
	commentBox.classList.add('comment-box')
	commentBox.classList.add('add-comment')
	const commentText = document.createElement('div')
	commentText.classList.add('add-comment__text')
	const commentFooter = document.createElement('div')
	const textArea = document.createElement('textarea')
	textArea.name = 'comment'
	textArea.placeholder = 'Add a comment...'
	textArea.classList.add('add-comment__text__input')
	commentFooter.classList.add('add-comment__footer')
	const footerImg = document.createElement('img')
	footerImg.classList.add('add-comment__footer__image')
	footerImg.alt = 'Post owner'
	footerImg.src = curUsr.image
	const submitDiv = document.createElement('div')
	submitDiv.classList.add('add-comment__footer__submit')
	const submitBtn = document.createElement('button')
	submitBtn.classList.add('add-comment__footer__submit__btn')

	container.append(commentBox)
	commentBox.append(commentText, commentFooter)
	commentText.append(textArea)
	commentFooter.append(footerImg, submitDiv)
	submitDiv.append(submitBtn)
	return commentBox
}

const addCommentPart = () => {
	const commentBox = createAddCommentPart()
	commentBox.classList.add('main-comment')
	const submitBtn = commentBox.querySelector('.add-comment__footer__submit__btn')
	submitBtn.textContent = 'SEND'
	submitBtn.addEventListener('click', pushComment)
}

const addReplyPart = e => {
	const commentBox = createAddCommentPart()
	let id = e.target.parentNode.dataset.parentId
	let target = e.target.parentNode.dataset.replyTarget
	let nextId = Number(id) + 1
	const submitBtn = commentBox.querySelector('.add-comment__footer__submit__btn')
	submitBtn.textContent = 'REPLY'
	submitBtn.dataset.replyTarget = target
	commentBox.classList.add('comment-response')
	commentBox.dataset.parentId = id
	submitBtn.addEventListener('click', pushReply)
	let beforeElement = container.querySelector(`.comment-box[data-main-id="${nextId}"]`)
	if (beforeElement != null) {
		container.insertBefore(commentBox, beforeElement)
	} else if (nextMainId > nextId) {
		do {
			nextId++
			beforeElement = container.querySelector(`.comment-box[data-main-id="${nextId}"]`)
			if (beforeElement != null) {
				container.insertBefore(commentBox, beforeElement)
			}
		} while (nextMainId > nextId)
	} else {
		const addCommentBox = document.querySelector('.main-comment')
		container.insertBefore(commentBox, addCommentBox)
	}
}

const pushComment = () => {
	lastId++
	const now = new Date().getTime()
	const addCommentBox = document.querySelector('.main-comment')
	const input = addCommentBox.querySelector('.add-comment__text__input')
	const content = input.value
	input.value = ''
	test = curUsr.image
	const newComment = createComment(curUsr.image, curUsr.userName, now, content, lastId, 0, nextMainId)
	const commentObj = {
		id: lastId,
		content: content,
		createdAt: now,
		score: 0,
		user: {
			image: {
				png: curUsr.image,
			},
			username: curUsr.userName,
		},
		replies: [],
	}
	const commentElement = new Comment(commentObj, nextMainId)

	container.insertBefore(newComment, addCommentBox)
	allComments.push(commentElement)
	saveComments()
	nextMainId++
}

const pushReply = e => {
	lastId++
	const eventTarget = e.target
	const replyTo = eventTarget.dataset.replyTarget
	const now = new Date().getTime()
	const commentBox = eventTarget.closest('.add-comment')
	const parentId = commentBox.dataset.parentId
	const input = commentBox.querySelector('.add-comment__text__input').value
	const newComment = createComment(curUsr.image, curUsr.userName, now, input, lastId, 0, parentId, replyTo)
	const replyObj = {
		id: lastId,
		content: input,
		createdAt: now,
		score: 0,
		replyingTo: replyTo,
		user: {
			image: {
				png: curUsr.image,
			},
			username: curUsr.userName,
		},
	}
	const replyElement = new Reply(replyObj, parentId)

	container.insertBefore(newComment, commentBox)
	commentBox.remove()
	allReplies.push(replyElement)
	let commentParent = getMainComment(parentId)
	commentParent.replies.push(replyElement)
	saveReplies()
	saveComments()
}

function getMainComment(mainId) {
	for (let i = 0; i < allComments.length; i++) {
		if (allComments[i].mainId == mainId) {
			return allComments[i]
		}
	}
	return null
}

function getReplyComment(id) {
	for (let i = 0; i < allReplies.length; i++) {
		if (allReplies[i].id == id) {
			return allReplies[i]
		}
	}
	return null
}

function getReplyFromMain(comment, id) {
	let replies = comment.replies
	for (let i = replies.length - 1; i > 0; i--) {
		if (replies[i].id == id) {
			return replies[i]
		}
	}
	return null
}

function getCommentById(id, isMainComment) {
	if (isMainComment) {
		for (let i = 0; i < allComments.length; i++) {
			if (allComments[i].id == id) {
				return allComments[i]
			}
		}
		return null
	} else {
		getReplyComment(id)
	}
}

function removeCommentReply(parentId, id) {
	for (let i = 0; i < allComments.length; i++) {
		console.log('f1')
		if (allComments[i].mainId == parentId) {
			console.log('i1')
			let comment = allComments[i]
			for (let j = comment.replies.length - 1; j > 0; j--) {
				console.log('f2')
				if (comment.replies[j].id == id) {
					console.log('i2')
					comment.replies.splice(j, 1)
					break
				}
			}
			break
		}
	}
}

const modifyVote = (e, num) => {
	const voteParent = e.target.closest('.comment-box__edit__vote')
	const voteStats = voteParent.querySelector('.comment-box__edit__vote__stats')
	test = voteStats
	const togglePlus = voteParent.dataset.plusCount == 0 && voteParent.dataset.minusCount == 1
	const toggleMinus = voteParent.dataset.plusCount == 1 && voteParent.dataset.minusCount == 0
	if (voteStats != null) {
		let val = Number(voteStats.textContent)
		if (num > 0 && togglePlus) {
			voteStats.textContent = val + num * 2
			voteParent.dataset.plusCount = 1
			voteParent.dataset.minusCount = 0
			voteStats.classList.toggle('comment-box__edit__vote__stats--up')
			voteStats.classList.toggle('comment-box__edit__vote__stats--down')
		} else if (num < 0 && toggleMinus) {
			voteStats.textContent = val + num * 2
			voteParent.dataset.plusCount = 0
			voteParent.dataset.minusCount = 1
			voteStats.classList.toggle('comment-box__edit__vote__stats--up')
			voteStats.classList.toggle('comment-box__edit__vote__stats--down')
		} else if (num > 0 && voteParent.dataset.plusCount == 0) {
			voteStats.textContent = val + num
			voteParent.dataset.plusCount = 1
			voteStats.classList.add('comment-box__edit__vote__stats--up')
		} else if (num > 0) {
			voteStats.textContent = val - num
			voteParent.dataset.plusCount = 0
			voteStats.classList.remove('comment-box__edit__vote__stats--up')
		} else if (num < 0 && voteParent.dataset.minusCount == 0) {
			voteStats.textContent = val + num
			voteParent.dataset.minusCount = 1
			voteStats.classList.add('comment-box__edit__vote__stats--down')
		} else {
			voteStats.textContent = val - num
			voteParent.dataset.minusCount = 0
			voteStats.classList.remove('comment-box__edit__vote__stats--down')
		}
	}
}

const upVote = e => {
	modifyVote(e, 1)
}

const downVote = e => {
	modifyVote(e, -1)
}

const showModal = e => {
	modal.classList.add('modal--active')
	modalTarget = e.target.closest('.comment-box')
}

const cancelModal = () => {
	modal.classList.remove('modal--active')
}

const deleteBox = () => {
	modal.classList.remove('modal--active')
	let id = modalTarget.dataset.id
	let mainId = modalTarget.dataset.mainId
	let parentId = modalTarget.dataset.parentId
	if (mainId != null) {
		for (let i = allComments.length - 1; i > 0; i--) {
			if (allComments[i].mainId == mainId) {
				console.log('Found' + mainId)
				allComments.splice(i, 1)
				saveComments()
			} else {
				console.log('comment not found')
			}
		}
	} else {
		for (let j = allReplies.length - 1; j > 0; j--) {
			if (allReplies[j].id == id) {
				console.log(allReplies[j].content)
				allReplies.splice(j, 1)
				saveReplies()
				break
			}
		}
		removeCommentReply(parentId, id)
		saveComments()
	}
	modalTarget.remove()
}

const editComment = e => {
	let box = e.target.closest('.comment-box')
	box.classList.toggle('add-comment')
	let target = box.querySelector('.response-target')
	let content = box.querySelector('.text-content')
	let str = ''
	if (target != null) {
		str += target.textContent
		str += ' '
	}
	str += content.textContent
	let textBox = createEditTextArea(str)
	box.append(textBox)
	let updateBox = document.createElement('div')
	updateBox.classList.add('comment-box__update')
	let btn = document.createElement('button')
	btn.classList.add('comment-box__update__btn')
	updateBox.append(btn)
	btn.textContent = 'UPDATE'
	box.append(updateBox)
	let boxToRemove = box.querySelector('.comment-box__text')
	boxToRemove.remove()
	btn.addEventListener('click', updateComment)
}

function createEditTextArea(str) {
	const addCommentText = document.createElement('div')
	addCommentText.classList.add('add-comment__text')
	addCommentText.classList.add('add-comment__text--update')
	const textArea = document.createElement('textarea')
	addCommentText.append(textArea)
	textArea.textContent = str
	textArea.classList.add('add-comment__text__input')
	return addCommentText
}

const updateComment = e => {
	const btn = e.target
	const box = btn.closest('.comment-box')
	let id = box.dataset.id
	let mainId = box.dataset.mainId
	let content = box.querySelector('textarea').value
	let textPart = ''
	if (content.includes('@')) {
		let replyTo = content.split(' ')[0]
		replyTo = replyTo.split('@')[1]
		content = content.slice(replyTo.length + 1)
		textPart = createTextPart(content, replyTo)
	} else {
		textPart = createTextPart(content)
	}
	box.append(textPart)
	const updateBtn = box.querySelector('.comment-box__update')
	const addComment = box.querySelector('.add-comment__text')
	box.classList.remove('add-comment')
	addComment.remove()
	updateBtn.remove()
	updateCommentContent(content, id, mainId)
}

function updateCommentContent(content, id, mainId) {
	let comment
	//update replies didnt work
	if (mainId != null) {
		comment = getMainComment(mainId)
		if (comment) {
			comment.content = content
			saveComments()
		}
	} else {
		let reply = getReplyComment()
		if (reply) {
			reply.content = content
			saveReplies()
			comment = getMainComment(reply.parentId)
			if (comment) {
				let reply2 = getReplyFromMain(comment, id)
				if (reply2) {
					reply2.content = content
					saveComments()
				}
			}
		}
	}
}

function saveUser() {
	localStorage.setItem('currentUser', JSON.stringify(curUsr))
}

const getUser = () => {
	let user = localStorage.getItem('currentUser')
	curUsr = JSON.parse(user)
}

const saveComments = () => {
	localStorage.setItem('allComments', JSON.stringify(allComments))
}

const downloadComments = () => {
	let comments = localStorage.getItem('allComments')
	allComments = JSON.parse(comments)
}

const saveReplies = () => {
	localStorage.setItem('allReplies', JSON.stringify(allReplies))
}

const downloadReplies = () => {
	let replies = localStorage.getItem('allReplies')
	allReplies = JSON.parse(replies)
}

document.addEventListener('DOMContentLoaded', fetchData)
modalCancel.addEventListener('click', cancelModal)
modalDelete.addEventListener('click', deleteBox)
