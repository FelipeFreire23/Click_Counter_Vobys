# Click Counter Vobys

**Candidato:** Felipe de Oliveira Freire

## Descrição do Projeto

Uma aplicação React Native completa para contagem de cliques com gerenciamento de histórico e funcionalidades avançadas de exportação. O app oferece uma interface intuitiva com modo escuro, persistência de dados e múltiplas opções de exportação.

## Funcionalidades Implementadas

### Requisitos Básicos (100% Atendidos)
- **Contador de Cliques**: Botão principal "CLIQUE AQUI" que incrementa contador
- **Registro de Timestamps**: Cada clique salva data/hora exata
- **Histórico Ordenado**: Lista do mais recente para mais antigo
- **Persistência Local**: Dados salvos com AsyncStorage
- **Exportação TXT**: Geração e compartilhamento de arquivo .txt
- **Limpeza com Confirmação**: Dialog nativo para confirmar exclusão
- **Estado Vazio**: Mensagem quando não há cliques registrados

### Funcionalidades Extras
- **Modo Escuro**: Toggle para alternar tema claro/escuro
- **Múltiplos Formatos**: Exportação em TXT, CSV e XLSX
- **Navegação por Tabs**: Interface organizada em 3 seções
- **Design Responsivo**: Interface adaptada para diferentes tamanhos
- **Performance Otimizada**: Lista virtualizada para grandes históricos
- **Feedback Visual**: Animações e estados de carregamento
- **Salvamento Automático**: Dados persistidos a cada ação

## Estrutura do App

### **Contador** (Página Principal)
- Botão de clique com feedback visual
- Display da contagem total
- Interface limpa e intuitiva

### **Histórico**
- Lista completa de todos os cliques
- Formatação de data/hora em português brasileiro
- Botões de ação: Compartilhar e Limpar
- Downloads em múltiplos formatos (TXT, CSV, XLSX)

### **Configurações**
- Toggle para modo escuro
- Informações do aplicativo
- Estatísticas de uso

## Tecnologias Utilizadas

- **React Native**: Framework principal
- **AsyncStorage**: Persistência de dados local
- **Expo File System**: Manipulação de arquivos
- **Expo Sharing**: Compartilhamento nativo
- **React Hooks**: Gerenciamento de estado
- **Native APIs**: Share, Alert, SafeAreaView

## Pré-requisitos

- Node.js LTS (v16 ou superior)
- npm ou Yarn
- Java JDK 17 (para Android)
- Android Studio com SDK configurado
- Xcode (para iOS - apenas macOS)
- Expo CLI (opcional, mas recomendado)

## Como Executar

### **Instalação das Dependências**

```bash
# Clone o repositório
git clone [URL_DO_REPOSITORIO]
cd click-counter-vobys

# Instale as dependências
npm install
# ou
yarn install
```

### **Executar no Android**

```bash
# Certifique-se de que o emulador Android está rodando
# ou dispositivo conectado via USB

npx react-native run-android
```

### **Executar no iOS** (apenas macOS)

```bash
# Instale os pods do iOS
cd ios && pod install && cd ..

# Execute no simulador iOS
npx react-native run-ios
```

### **Alternativa com Expo** (se configurado)

```bash
# Inicie o Expo
npx expo start

# Escaneie o QR Code com o app Expo Go
# ou pressione 'a' para Android / 'i' para iOS
```

### **Arquitetura Implementada**

- **Estado Centralizado**: Hooks do React para gerenciamento
- **Componentes Modulares**: Separação clara de responsabilidades
- **Persistência Robusta**: AsyncStorage com tratamento de erros
- **Navegação Simples**: Sistema de tabs sem dependências extras
- **Exportação Flexível**: Múltiplos formatos com compartilhamento nativo

## Formatos de Exportação

### **TXT**
```
Histórico de Cliques - Total: 15
Gerado em: 27/09/2025 14:30:25
========================================

1. 27/09/2025 14:30:25
2. 27/09/2025 14:29:18
...
```

### **CSV**
```csv
Numero,Data,Hora
1,"27/09/2025","14:30:25"
2,"27/09/2025","14:29:18"
...
```

### **XLSX**
Formato compatível com Excel usando separador ponto-e-vírgula (padrão brasileiro) e encoding UTF-8 com BOM.

## Design System

### **Cores**
- **Primária**: #4CAF50 (Verde)
- **Secundária**: #2196F3 (Azul)
- **Perigo**: #f44336 (Vermelho)
- **Tema Escuro**: Suporte completo

### **Componentes**
- Cards com bordas arredondadas
- Botões com feedback tátil
- Typography consistente
- Espaçamentos padronizados

## Decisões Técnicas

### **Por que estas escolhas?**

1. **AsyncStorage**: Simples, confiável e nativo do React Native
2. **Hooks do React**: Gerenciamento de estado sem bibliotecas extras
3. **Expo File System**: APIs robustas para manipulação de arquivos
4. **Navegação Custom**: Evita dependências desnecessárias para um app simples
5. **Performance**: Lista virtualizada para suportar milhares de cliques

### **Tratamento de Erros**

- Try-catch em todas as operações async
- Fallbacks para dados corrompidos
- Alertas informativos para o usuário
- Logs de erro para debugging

### **UX/UI**

- Feedback visual em todas as interações
- Estados de loading e vazio
- Confirmações para ações destrutivas
- Design responsivo e acessível

## Atendimento aos Requisitos

| Requisito | Status | Implementação |
|-----------|--------|---------------|
| Botão de clique | ✅ | TouchableOpacity com "CLIQUE AQUI" |
| Incremento do contador | ✅ | Estado React com persistência |
| Timestamp por clique | ✅ | Date.now() a cada clique |
| Histórico ordenado | ✅ | Array invertido (mais recente primeiro) |
| Lista de histórico | ✅ | FlatList otimizada |
| Persistência local | ✅ | AsyncStorage com JSON |
| Exportação TXT | ✅ | Geração + compartilhamento nativo |
| Limpeza com confirmação | ✅ | Alert.alert com opções |
| Estado vazio | ✅ | "Nenhum clique ainda" |

## Suporte

Para dúvidas ou problemas:
1. Verifique se todas as dependências estão instaladas
2. Confirme se o ambiente React Native está configurado
3. Teste em um dispositivo/emulador limpo

## Licença

Este projeto foi desenvolvido como parte de um processo seletivo para a Vobys.

---

**Desenvolvido com ❤️ por Felipe de Oliveira Freire**
