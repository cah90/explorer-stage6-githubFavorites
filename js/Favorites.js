import { GithubUser } from "./GithubUser.js"

// classe que vai conter a logica dos dados.
// como os dados serao estruturados.
export class Favorites {
	constructor(root) {
		this.root = document.querySelector(root)
		this.load()

		GithubUser.search("cah90").then((user) => console.log(user))
	}

	load() {
		this.entries = JSON.parse(localStorage.getItem("@github-favorites:")) || []
	}

	save() {
		localStorage.setItem("@github-favorites:", JSON.stringify(this.entries))
	}

	async add(username) {
		//console.log(username)
		try {
			const userExists = this.entries.find((entry) => entry.login == username)
			if (userExists) {
				throw new Error("Usuário já cadastrado.")
			}
			const user = await GithubUser.search(username)
			//console.log(user)

			if (user.login === undefined) {
				throw new Error("Usuário não encontrado.")
			}

			this.entries = [user, ...this.entries]
			this.update()
			this.save()
		} catch (err) {
			alert(err.message)
		}
	}

	delete(user) {
		const filteredEntries = this.entries.filter((entry) => {
			return entry.login !== user.login
		})

		//console.log(filteredEntries)

		this.entries = filteredEntries
		this.update()
		this.save()

	}
}

// classe que vai criar a visualizacao e eventos do HTML
export class FavoritesView extends Favorites {
	constructor(root) {
		super(root)

		this.tbody = this.root.querySelector("table tbody")

		this.update()
		this.onadd()
	}

	onadd() {
		const addButton = this.root.querySelector(".search button")
		addButton.onclick = () => {
			const { value } = this.root.querySelector(".search input")
			//console.dir(value)
			this.add(value)
		}
	}

	update() {
		this.removeAllTr()

		this.entries.forEach((user) => {
			//console.log(user)

			const row = this.createRow()

			row.querySelector(
				".user img"
			).src = `https://github.com/${user.login}.png`
			row.querySelector(".user img").alt = `Imagem de ${user.name}`
			row.querySelector(".user a").href = `https://github.com/${user.login}`
			row.querySelector(".user p").textContent = user.name
			row.querySelector(".user span").textContent = user.login
			row.querySelector(".repositories").textContent = user.public_repos
			row.querySelector(".followers").textContent = user.followers

			row.querySelector(".remove").onclick = () => {
				const isOk = confirm("Tem certeza que deseja deletar essa linha?")

				if (isOk) {
					this.delete(user)
				}
			}

			this.tbody.append(row)
		})
	}

	createRow() {
		const tr = document.createElement("tr")

		const content = `
            <td class="user">
              <img src="" alt="" />
              <a href="https://github.com/cah90" target="_blank">
                <p>Cassia Bernardo</p>
                <span>cascrisbern</span>
              </a>
            </td>
            <td class="repositories">76</td>
            <td class="followers">8888</td>
            <td><button class="remove">&times;</button></td>
    `

		tr.innerHTML = content

		return tr
	}

	removeAllTr() {
		this.tbody.querySelectorAll("tr").forEach((tr) => {
			tr.remove()
		})
	}
}
