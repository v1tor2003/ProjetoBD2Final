// SEMEADOR - Script responsavel por inserir os dados gerados pelo faker ou de alguma fonte do diretorio do projeto
import { PrismaClient } from '@prisma/client'
import { funcionarios, carros, versoes } from './seed';
import { fakerPT_BR } from '@faker-js/faker';
import { subYears } from 'date-fns';

const prisma = new PrismaClient()

type Funcionario = {
  detalhes: {
    nome: string,
    phone: string,
    nascimento: Date,
  }
  usuario: string,
  senha: string,
  salario: number
  cargo: string
}

type Carro = {
  modelo: string,
  preco: number,
}

type Version = {
  nome: string,
  preco: number
}

type Color = {
  nome_cor: string,
  preco_cor: number
}

/**
 * Formata numero de telefone gerado pelo faker, tira o +55.
 * @returns {string} retorna string representando numero formatado
 */

function generatePhone(): string {
  let phone: string = fakerPT_BR.phone.number()
  
  if(phone.startsWith('+55 '))
    return phone.replace('+55 ', '')

  return phone
}

/**
 * Semeia a tabela funcionarios.
 * @param {Funcionario[]} funcionarios vetor com os funcionarios a serem inseridos
 * @returns {Promise<void>} a funcao eh um procedimento, sem retorno.
 */

async function seedFuncionarios(funcionarios: Funcionario[]): Promise<void>{
  
  for(const f of funcionarios){
    try {  
      await prisma.funcionario.create({
        data:{
          detalhespessoa:{
            create:{
              nascimento_pessoa: f.detalhes.nascimento,
              nome_pessoa: f.detalhes.nome,
              phone_pessoa: generatePhone()
            }
          },
          usuario_func: f.usuario,
          senha_func: f.senha,
          salario_func: f.salario,
          cargo_func: f.cargo
        }
      })

      console.log('Funcionario criado com sucesso')
    }catch (error) {
      console.log('Erro ao criar funcionario', error)
    }
  } 
}

/**
 * Semeia a tabela de clientes.
 * @param {number} quantidade a quantidade de cliente a serem geradas e inseridos
 * @returns {Promise<void>} a funcao eh um procedimento, sem retorno.
 */

async function seedClientes(quantidade: number): Promise<void> {
 
  for(let i = 0; i < quantidade; i++){
    try{  
      await prisma.cliente.create({
        data:{
          detalhespessoa: {
            create: {
              nome_pessoa: fakerPT_BR.person.fullName(),
              phone_pessoa: generatePhone(),
              nascimento_pessoa: fakerPT_BR.date.between({
                from: new Date('1950-01-01'),
                to: subYears(Date.now(), 18)
              })
            }
          }
        }
      })
      console.error("Cliente criado com sucesso");
    }catch(error){
      console.error("Erro ao criar Cliente:", error);
    } 
  }
  
}

/**
 * Semeia a tabela de carros.
 * @param {Carro[]} carros vetor com os carros a serem inseridos
 * @returns {Promise<void>} a funcao eh um procedimento, sem retorno.
 */

async function seedCarros(carros: Carro[]) {
  const min = 2
  const max = 10
  for(const c of carros){
    try {
      await prisma.carro.create({
        data: {
          modelo: c.modelo,
          preco_carro: c.preco,
          ano_fab: fakerPT_BR.number.int({min: 2000, max: 2024}),
          quantidade: Math.floor(Math.random() * (max - min + 1)) + min
        }
      })

      console.log('Carro criado com sucesso')
    } catch (error) {
      console.log('Erro ao criar carro', error)
    }
  }
  
}

/**
 * Semeia a tabela de cores.
 * @param {number} quantidade quantidade de cores geradas e inseridas
 * @returns {Promise<void>} a funcao eh um procedimento, sem retorno.
 */
async function seedCores(quantidade: number): Promise<void>{
  let colors: Color[] = []

  for(let i = 0; i < quantidade; i++){
    let color: Color = {
      nome_cor: '',
      preco_cor: 0.0
    }
    color.nome_cor = fakerPT_BR.color.human()
    if(!colors.includes(color)) {
      color.preco_cor = Number.parseFloat(fakerPT_BR.number.float({min: 0, max: 1000}).toFixed(2))
      colors.push(color)
    }
  }

  
  try {
    await prisma.cor.createMany({
      data: colors
    })
    console.log('Cores criadas com sucesso')
  } catch (error) {
    console.log('Erro ao criar cor:', error)
  }
  
}

/**
 * Semeia a tabela de versoes.
 * @param {Version[]} versions vetor com as versoes a serem inseridos
 * @returns {Promise<void>} a funcao eh um procedimento, sem retorno.
 */
async function seedVersoes(versions: Version[]): Promise<void> {
  for(const v of versions){
    try {
      await prisma.versao.create({
        data:{
          nome_versao: v.nome,
          preco_versao: v.preco
        }
      })

      console.log('Versao criada com sucesso')
    } catch (error) {
      console.log('Erro ao criar versao', error)
    }
  }
}


async function main(){
  const quantidadeClientes = 1000
  const quantidadeCores = 5

  await seedVersoes(versoes)
  await seedFuncionarios(funcionarios) 
  await seedClientes(quantidadeClientes)
  await seedCarros(carros)
  await seedCores(quantidadeCores)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })

