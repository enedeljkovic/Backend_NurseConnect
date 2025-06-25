const express = require('express');
const crypto = require('crypto');
const { Sequelize } = require('sequelize');
const Profesor = require('./Models/profesor');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sequelize = new Sequelize('NurseConnect', 'postgres', 'fdg5ahee', {
  host: 'localhost',
  dialect: 'postgres',
});
const Student = require('./Models/student');
const Material = require('./Models/material');
const Quiz = require('./Models/quiz');
const Admin = require('./Models/admin');

const app = express();
const port = 3001;
const cors = require('cors');
app.use(cors());


app.use(express.json({ limit: '10mb' })); 


app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); 

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });


let students = [];
let materials = []; 
let quizzes = []; 

function generateKey() {
    return crypto.randomBytes(8).toString('hex');
}

sequelize.sync()
  .then(() => console.log('Baza podataka je sinkronizirana!'))
  .catch((error) => console.error('Greška pri sinkronizaciji baze:', error));


app.get('/students', async (req, res) => {
  try {
    const studenti = await Student.findAll();
    res.json(studenti);
  } catch (error) {
    console.error('Greška pri dohvaćanju studenata:', error);
    res.status(500).json({ error: 'Greška na serveru.' });
  }
});


// POST route to register student
app.post('/students', async (req, res) => {
    const { ime, prezime, email } = req.body;

    if (!ime || !prezime || !email) {
        return res.status(400).json({ error: 'Svi podaci moraju biti prisutni!' });
    }

    try {
        const newStudent = await Student.create({
            ime,
            prezime,
            email,
            kod: generateKey()  
        });

        res.status(201).json(newStudent);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Greška pri dodavanju studenta u bazu!' });
    }
});


// PUT route to update student by ID
app.put('/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id); 
    const studentIndex = students.findIndex(student => student.id === studentId); 

    if (studentIndex === -1) {
        return res.status(404).send('Student not found');
    }

    const updatedStudent = req.body;
    updatedStudent.id = studentId;  
    students[studentIndex] = updatedStudent;  
    res.json(updatedStudent);  
});

// DELETE route to delete student by ID
app.delete('/students/:id', (req, res) => {
    const studentId = parseInt(req.params.id);
    const studentIndex = students.findIndex(student => student.id === studentId);

    if (studentIndex === -1) {
        return res.status(404).json({ error: 'Student not found' });
    }

    students.splice(studentIndex, 1);  
    res.status(204).send();  
});

// POST route for student login using activation key
app.post('/login', async (req, res) => {
    const { kod } = req.body;
  
    if (!kod) {
      return res.status(400).json({ error: 'Kod je obavezan!' });
    }
  
    try {
      const student = await Student.findOne({ where: { kod } });
  
      if (!student) {
        return res.status(404).json({ error: 'Student s tim kodom nije pronađen!' });
      }
  
      res.status(200).json({ message: 'Prijava uspješna!', student });
    } catch (error) {
      console.error('Greška pri prijavi:', error);
      res.status(500).json({ error: 'Greška na serveru prilikom prijave.' });
    }
  });

// GET route to fetch all materials from the database
// Dohvati jedan materijal po ID-u
app.get('/materials', async (req, res) => {
    try {
      const allMaterials = await Material.findAll();
      res.status(200).json(allMaterials);
    } catch (error) {
      console.error('Greška pri dohvaćanju materijala:', error);
      res.status(500).json({ error: 'Greška na serveru prilikom dohvaćanja materijala.' });
    }
  });
  
// POST route to add new material
app.post('/materials', async (req, res) => {
    console.log(req.body);

    const { naziv, opis, imageUrl, fileUrl, subject } = req.body;

    // Provjera da su svi podaci prisutni
    if (!naziv || !opis || !subject) {
        return res.status(400).json({ error: 'Naziv, opis i predmet su obavezni!' });
    }

    try {
        const newMaterial = await Material.create({
            naziv,
            opis,
            imageUrl: imageUrl || null,
            fileUrl: fileUrl || null,
            subject
        });

        res.status(201).json(newMaterial);
    } catch (error) {
        console.error('Error while creating material:', error);
        res.status(500).json({ error: 'Došlo je do pogreške prilikom unosa materijala.' });
    }
});


// PUT route to update material by ID
app.put('/materials/:id', async (req, res) => {
    const materialId = parseInt(req.params.id);
    const { naziv, opis, imageUrl, fileUrl } = req.body;
  
    try {
      const material = await Material.findByPk(materialId);
      if (!material) {
        return res.status(404).json({ error: 'Materijal nije pronađen' });
      }
  
      await material.update({
        naziv,
        opis,
        imageUrl: imageUrl || null,
        fileUrl: fileUrl || null
      });
  
      res.status(200).json(material);
    } catch (error) {
      console.error('Greška pri ažuriranju materijala:', error);
      res.status(500).json({ error: 'Greška pri ažuriranju materijala' });
    }
  });
// DELETE route to delete material by ID
app.delete('/materials/:id', async (req, res) => {
    const materialId = parseInt(req.params.id);
  
    try {
      const material = await Material.findByPk(materialId);
  
      if (!material) {
        return res.status(404).json({ error: 'Materijal nije pronađen' });
      }
  
      await material.destroy();
  
      console.log(`✔️ Materijal s ID-em ${materialId} je obrisan iz baze.`);
      res.status(204).send(); // 204 = No Content
    } catch (error) {
      console.error('❌ Greška pri brisanju materijala:', error);
      res.status(500).json({ error: 'Greška na serveru prilikom brisanja' });
    }
  });
  
  


// 📌 GET route to fetch all quizzes
app.get('/quizzes', async (req, res) => {
  try {
    const allQuizzes = await Quiz.findAll();
    res.status(200).json(allQuizzes);
  } catch (error) {
    console.error('Greška pri dohvaćanju kvizova:', error);
    res.status(500).json({ error: 'Greška na serveru.' });
  }
});

app.get('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findByPk(req.params.id);
    if (!quiz) return res.status(404).json({ error: 'Kviz nije pronađen.' });

    let pitanja = quiz.pitanja;

  
    if (typeof pitanja === 'string') {
      try {
        pitanja = JSON.parse(pitanja);
      } catch (e) {
        return res.status(500).json({ error: 'Pitanja nisu validan JSON.' });
      }
    }

    res.json({ ...quiz.toJSON(), pitanja });
  } catch (error) {
    console.error('Greška pri dohvaćanju kviza:', error);
    res.status(500).json({ error: 'Greška na serveru.' });
  }
});


app.get('/quizzes/subject/:predmet', async (req, res) => {
  try {
    const kvizovi = await Quiz.findAll({
      where: { predmet: req.params.predmet }
    });

    
    const kvizoviParsed = kvizovi.map(kviz => {
      let pitanja = kviz.pitanja;
      if (typeof pitanja === 'string') {
        try {
          pitanja = JSON.parse(pitanja);
        } catch (e) {
          pitanja = [];
        }
      }
      return { ...kviz.toJSON(), pitanja };
    });

    res.json(kvizoviParsed);
  } catch (err) {
    console.error('Greška pri dohvaćanju kvizova po predmetu:', err);
    res.status(500).json({ error: 'Greška na serveru.' });
  }
});


// 📌 POST route to add a new quiz
app.post('/quizzes', async (req, res) => {
  try {
    const { naziv, pitanja, predmet } = req.body;

    const noviKviz = await Quiz.create({
      naziv,
      pitanja,
      predmet 
    });

    res.status(201).json({ message: 'Kviz uspješno dodan!', quiz: noviKviz });
  } catch (err) {
    console.error('Greška pri dodavanju kviza:', err);
    res.status(500).json({ error: 'Greška na serveru.' });
  }
});


app.post('/quizzes/:id/check-answers', async (req, res) => {
  const { odgovori } = req.body;
  const quiz = await Quiz.findByPk(req.params.id);
  if (!quiz) return res.status(404).json({ error: 'Kviz nije pronađen.' });

  let pitanja = quiz.pitanja;
  if (typeof pitanja === 'string') {
    pitanja = JSON.parse(pitanja);
  }

  const rezultat = pitanja.map((p, i) => {
    const correct = Array.isArray(p.correct) ? [...p.correct].sort() : [p.correct];
    const user = Array.isArray(odgovori[i]) ? [...odgovori[i]].sort() : [odgovori[i]];
    return JSON.stringify(correct) === JSON.stringify(user);
  });

  res.json({ rezultat });
});


// DELETE kviz po ID
app.delete('/quizzes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const kviz = await Quiz.findByPk(id);
    if (!kviz) {
      return res.status(404).json({ error: 'Kviz nije pronađen.' });
    }

    await kviz.destroy();
    res.status(200).json({ poruka: 'Kviz uspješno obrisan.' });
  } catch (err) {
    console.error('Greška pri brisanju kviza:', err);
    res.status(500).json({ error: 'Greška na serveru.' });
  }
});



app.post('/check-answers', async (req, res) => {
  const { kvizId, odgovori } = req.body;

  try {
    const kviz = await Quiz.findByPk(kvizId);
    if (!kviz) {
      return res.status(404).json({ error: 'Kviz nije pronađen.' });
    }

    const pitanja = kviz.pitanja;

    const rezultat = pitanja.map((pitanje, index) => {
      const correct = pitanje.correct;
      const userAnswer = odgovori[index];
      const type = pitanje.type || 'multiple';

      if (type === 'multiple') {
        if (!Array.isArray(userAnswer)) return false;
        const correctSorted = [...correct].sort();
        const userSorted = [...userAnswer].sort();
        return JSON.stringify(correctSorted) === JSON.stringify(userSorted);
      }

      if (type === 'truefalse') {
        return correct === userAnswer;
      }

      return false;
    });

    res.json({ rezultat });
  } catch (error) {
    console.error('Greška u provjeri kviza:', error);
    res.status(500).json({ error: 'Greška na serveru.' });
  }
});





app.post('/login-profesor', async (req, res) => {
    const { kod } = req.body;
  
    if (!kod) {
      return res.status(400).json({ error: 'Kod je obavezan!' });
    }
  
    try {
      const profesor = await Profesor.findOne({ where: { kod } });
  
      if (!profesor) {
        return res.status(404).json({ error: 'Profesor s tim kodom nije pronađen!' });
      }
  
      res.status(200).json({ message: 'Prijava uspješna!', profesor });
    } catch (err) {
      console.error('Greška pri prijavi profesora:', err);
      res.status(500).json({ error: 'Greška na serveru!' });
    }
  });

  // 📌 POST ruta za dodavanje profesora
app.post('/profesori', async (req, res) => {
  const { ime, prezime, email, kod } = req.body;

  if (!ime || !prezime || !email || !kod) {
    return res.status(400).json({ error: 'Sva polja su obavezna!' });
  }

  try {
    const noviProfesor = await Profesor.create({ ime, prezime, email, kod });
    res.status(201).json(noviProfesor);
  } catch (error) {
    console.error('Greška pri dodavanju profesora:', error);
    res.status(500).json({ error: 'Neuspješno dodavanje profesora.' });
  }
});


app.post('/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: 'Datoteka nije poslana.' });
    }
  
    const filePath = `http://localhost:3001/uploads/${req.file.filename}`;
    res.status(200).json({ fileUrl: filePath });
  });
  

  app.post('/admin/login', async (req, res) => {
    console.log('POZVANA /admin/login ruta');
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ where: { email } });
    console.log('ADMIN IZ BAZE:', admin);
    if (!admin) return res.status(401).json({ error: 'Neispravni podaci.' });

    const isMatch = await bcrypt.compare(password, admin.lozinka);
    if (!isMatch) return res.status(401).json({ error: 'Neispravni podaci.' });

    const token = jwt.sign({ id: admin.id, role: 'admin' }, 'tajna_lozinka');
    res.json({ token });
    console.log('PRIMLJENI PODACI:', req.body);

  } catch (error) {
    res.status(500).json({ error: 'Greška na serveru.' });
  }
});


app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

// PostgreSQL connection test
sequelize.authenticate()
  .then(() => {
    console.log('Veza s bazom je uspješno uspostavljena!');
  })
  .catch(err => {
    console.error('Nije moguće uspostaviti vezu s bazom:', err);
  });
