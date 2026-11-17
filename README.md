# TEA Histórias — Sprint 3

Aplicativo Android de histórias sociais em português do Brasil. A biblioteca inclui 35 cenas ilustradas em nove histórias. As histórias e a posição de leitura ficam no SQLite do dispositivo. Ao concluir uma história, ela volta à primeira cena na próxima abertura.

Na biblioteca, **Nova história** abre o editor. Dê um título e uma categoria, escreva cada cena e escolha uma ilustração do acervo, se quiser. Use **Editar história** no cartão de uma história própria. Ao salvar uma edição, a leitura daquela história recomeça na primeira cena.

Use **Favoritar** em um cartão e **Favoritos** para filtrar a biblioteca. Em **Configurações**, é possível aumentar o texto ou ocultar ilustrações. O app salva essas escolhas no dispositivo.

A busca da biblioteca encontra títulos e categorias mesmo sem acentos. Ela funciona em conjunto com os filtros. No editor, **Subir cena** e **Descer cena** mudam a ordem após salvar. Use **Excluir história** no cartão de uma história própria e confirme a exclusão.

Em **Configurações**, escolha o idioma da interface e o tema. O modo **Automático** acompanha o tema do Android. Os textos das histórias são exibidos em seu idioma original. Toque no endereço de contato para abrir o aplicativo de e-mail.

Instale o APK 1.3.0 sobre a versão instalada para manter o progresso, as histórias próprias, os favoritos e os ajustes.

## Desenvolver no Fedora

Use Node.js 22.13 ou superior, JDK 17 e o Android SDK com o caminho configurado em `ANDROID_HOME`. Para este projeto, instale a plataforma Android 36, Build Tools 36.0.0, NDK 27.1.12297006 e CMake 3.22.1 pelo gerenciador do Android SDK.

```sh
npm ci
npm run typecheck
npm test
npm run android
```

## Gerar APK de teste local

```sh
npx expo prebuild --platform android --no-install
cd android
./gradlew :app:assembleRelease
adb install -r app/build/outputs/apk/release/app-release.apk
```

O APK incorpora o código e as imagens. Ele abre diretamente no Android. O projeto nativo gerado pelo Expo assina esta compilação com a chave de teste.

## Roteiro de teste no Android

1. Desative Wi-Fi e dados móveis antes da primeira abertura. Confira os nove títulos e os filtros da biblioteca.
2. Abra cada história e avance pelas cenas. Use o botão de voltar do Android e o botão Voltar à biblioteca.
3. Em uma cena intermediária, encerre o app e abra a história novamente. Confira a retomada. Conclua a história e confirme que a próxima abertura começa na primeira cena.
4. Crie uma história com duas cenas, favorite-a e edite-a. Reinicie o app e confira a história, o favorito e os ajustes de leitura.
5. Procure uma história pelo título sem acentos. Mova uma cena, salve e confira a nova ordem no leitor. Teste cancelar e confirmar a exclusão de uma história própria.
6. Com o TalkBack ativo, confira os botões e o anúncio do título ao trocar de cena. Aumente o texto do Android e confirme que as cenas e os controles continuam acessíveis pela rolagem.

O pacote Android é `com.teahistorias.app`. O ícone usa o logotipo aprovado em dois formatos, para a biblioteca e o inicializador Android.
