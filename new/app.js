const App = {
    data() {
        return {
            placeholderString: 'Введите название заметки',
            title: 'Список заметок',
            inputValue: '',
            notes: ['Заметка 1','Заметка 2','Заметка 3']
        }

    },
    methods: {
        inputChangeHandler(event) {
            console.log(event.target.value)
            this.inputValue = event.target.value
        },

        addNewNote() {
            this.notes.push(this.inputValue)
        }

    },
}

Vue.createApp(App).mount('#app')
