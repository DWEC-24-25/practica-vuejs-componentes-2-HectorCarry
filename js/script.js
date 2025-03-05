// Sample data
const server_data = {
    collection: {
        title: "Movie List",
        type: "movie",
        version: "1.0",

        items: [
            {
                href: "https://en.wikipedia.org/wiki/The_Lord_of_the_Rings_(film_series)",
                data: [
                    { name: "name", value: "The Lord of the Rings", prompt: "Name" },
                    { name: "description", value: "The Lord of the Rings is a film series consisting of three high fantasy adventure films directed by Peter Jackson. They are based on the novel The Lord of the Rings by J. R. R. Tolkien. The films are subtitled The Fellowship of the Ring (2001), The Two Towers (2002) and The Return of the King (2003). They are a New Zealand-American venture produced by WingNut Films and The Saul Zaentz Company and distributed by New Line Cinema.", prompt: "Description" },
                    { name: "director", value: "Peter Jackson", prompt: "Director" },
                    { name: "datePublished", value: "2001-12-19", prompt: "Release Date" }
                ]
            },
            {
                href: "https://en.wikipedia.org/wiki/The_Hunger_Games_(film_series)",
                data: [
                    { name: "name", value: "The Hunger Games", prompt: "Name" },
                    { name: "description", value: "The Hunger Games film series consists of four science fiction dystopian adventure films based on The Hunger Games trilogy of novels, by the American author Suzanne Collins. Distributed by Lionsgate and produced by Nina Jacobson and Jon Kilik, it stars Jennifer Lawrence as Katniss Everdeen, Josh Hutcherson as Peeta Mellark, Woody Harrelson as Haymitch Abernathy, Elizabeth Banks as Effie Trinket, Philip Seymour Hoffman as Plutarch Heavensbee, Stanley Tucci as Caesar Flickerman, Donald Sutherland as President Snow, and Liam Hemsworth as Gale Hawthorne. Gary Ross directed the first film, while Francis Lawrence directed the next three films.", prompt: "Description" },
                    { name: "director", value: "Gary Ross", prompt: "Director" },
                    { name: "datePublished", value: "2012-03-12", prompt: "Release Date" }
                ]
            },
            {
                href: "https://en.wikipedia.org/wiki/Game_of_Thrones",
                data: [
                    { name: "name", value: "Game of Thrones", prompt: "Name" },
                    { name: "description", value: "Game of Thrones is an American fantasy drama television series created by David Benioff and D. B. Weiss. It is an adaptation of A Song of Ice and Fire, George R. R. Martin's series of fantasy novels, the first of which is A Game of Thrones. It is filmed in Belfast and elsewhere in the United Kingdom, Canada, Croatia, Iceland, Malta, Morocco, Spain, and the United States. The series premiered on HBO in the United States on April 17, 2011, and its seventh season ended on August 27, 2017. The series will conclude with its eighth season premiering in 2019.", prompt: "Description" },
                    { name: "director", value: "Alan Taylor et al", prompt: "Director" },
                    { name: "datePublished", value: "2011-04-17", prompt: "Release Date" }
                ]
            }
        ]
    }
};

const { createApp, defineComponent, reactive, ref } = Vue;

// Componente edit-form
const EditForm = defineComponent({
    props: {
        itemdata: {
            type: Object,
            required: true
        },
        index: {
            type: Number,
            required: true
        }
    },
    emits: ['formClosed'],
    setup(props, { emit }) {
        const closeForm = () => {
            emit('formClosed');
        };

        // Variable reactiva para la fecha de estreno
        const rawDate = Vue.ref(props.itemdata.data.find(d => d.name === 'datePublished').value);

        // Computed para formatear la fecha cuando el usuario termine de editar
        const formattedDate = Vue.computed({
            get: () => rawDate.value,
            set: (newValue) => {
                // Si solo tiene 4 dígitos (año), añadir '-01-01'
                if (/^\d{4}$/.test(newValue)) {
                    rawDate.value = `${newValue}-01-01`;
                } 
                // Si tiene el formato correcto, actualizar el valor
                else if (/^\d{4}-\d{2}-\d{2}$/.test(newValue)) {
                    rawDate.value = newValue;
                }
                // Si es un formato incorrecto, no modificarlo hasta que sea válido
            }
        });

        // Función que se activa al salir del campo de fecha
        const validateDate = () => {
            // Asignamos la fecha ya validada al itemdata
            props.itemdata.data.find(d => d.name === 'datePublished').value = rawDate.value;
        };

        return { closeForm, formattedDate, validateDate };
    },
    template: `
        <div class="card p-3 bg-light">
            <h5>Editar Película</h5>
            <form>
                <div class="mb-3">
                    <label :for="'title-' + index" class="form-label">Título</label>
                    <input :id="'title-' + index" v-model="itemdata.data.find(d => d.name === 'name').value" type="text" class="form-control">
                </div>

                <div class="mb-3">
                    <label :for="'year-' + index" class="form-label">Fecha de Estreno</label>
                    <input :id="'year-' + index" v-model="formattedDate" @blur="validateDate" type="text" class="form-control" placeholder="YYYY-MM-DD o YYYY">
                </div>

                <div class="mb-3">
                    <label :for="'director-' + index" class="form-label">Director</label>
                    <input :id="'director-' + index" v-model="itemdata.data.find(d => d.name === 'director').value" type="text" class="form-control">
                </div>

                <button @click.prevent="closeForm" class="btn btn-secondary">Cerrar</button>
            </form>
        </div>
    `
});



// Componente item-data
const ItemData = defineComponent({
    props: {
        item: {
            type: Object,
            required: true
        },
        index: {
            type: Number,
            required: true
        }
    },
    setup(props) {
        const isEditing = ref(false);

        const toggleEditFormVisibility = () => {
            isEditing.value = !isEditing.value;
        };

        return { isEditing, toggleEditFormVisibility };
    },
    template: `
        <div class="card mb-3 p-3">
            <div v-if="!isEditing">
                <h3>{{ item.data.find(d => d.name === 'name').value }}</h3>
                <p>{{ item.data.find(d => d.name === 'description').value }}</p>
                <p><strong>Director:</strong> {{ item.data.find(d => d.name === 'director').value }}</p>
                <p><strong>Release Date:</strong> {{ item.data.find(d => d.name === 'datePublished').value }}</p>
                <a :href="item.href" class="btn btn-primary" target="_blank">Más Info</a>
                <button @click="toggleEditFormVisibility" class="btn btn-warning ms-2">Editar</button>
            </div>

            <edit-form 
                v-if="isEditing" 
                :itemdata="item" 
                :index="index" 
                @formClosed="toggleEditFormVisibility">
            </edit-form>
        </div>
    `
});

// Crear la aplicación Vue
const app = createApp({
    setup() {
        const col = reactive(server_data.collection);

        return { col };
    },
    template: `
        <div class="container mt-4">
            <div class="jumbotron text-center p-4 bg-light rounded">
                <h1 id="title">{{ col.title }}</h1>
            </div>
            <div class="row">
                <div class="col-lg-4 col-md-6 col-sm-12" v-for="(item, index) in col.items" :key="index">
                    <item-data :item="item" :index="index"></item-data>
                </div>
            </div>
        </div>
    `
});

// Registrar los componentes globalmente
app.component('edit-form', EditForm);
app.component('item-data', ItemData);

// Montar la aplicación en el elemento con id 'app'
app.mount('#app');
