# Pasta de Áudios - Truco Acker App

Coloque aqui todos os arquivos `.mp3` gerados com `edge-tts` usando a voz `pt-BR-FranciscaNeural`.

Consulte o documento `lista_audios_truco.md` para ver a lista completa de 47 arquivos necessários.

## Comando para gerar um MP3 no Colab:
```python
import edge_tts
import asyncio

async def gerar(texto, arquivo):
    communicate = edge_tts.Communicate(texto, "pt-BR-FranciscaNeural")
    await communicate.save(f"{arquivo}")

# Exemplo:
asyncio.run(gerar("Truco", "truco.mp3"))
```

## Script para gerar TODOS de uma vez:
```python
import edge_tts
import asyncio

frases = {
    "truco.mp3": "Truco",
    "seis.mp3": "Seis",
    "nove.mp3": "Nove",
    "doze.mp3": "Doze",
    "para.mp3": "para",
    "mao_de_11.mp3": "Mão de 11 para a equipe",
    "decidir_mao_11.mp3": "Podem olhar as cartas e decidir se aceitam a partida por 3 pontos ou se vão correr!",
    "escurinha.mp3": "Escurinha! Jogo no escuro, não vale pedir truco.",
    "jogo_aceito.mp3": "Jogo aceito! Valendo 3 pontos!",
    "correu.mp3": "Correu! Um ponto para o adversário.",
    "acao_desfeita.mp3": "Ação desfeita.",
    "nada_desfazer.mp3": "Nada para desfazer.",
    "jogo_reiniciado.mp3": "Jogo atual reiniciado.",
    "placar_zerado.mp3": "Placar geral zerado. Configure os nomes.",
    "som_ativado.mp3": "Som ativado.",
    "nomes_atualizados.mp3": "Nomes dos jogadores atualizados.",
    "equipes_atualizadas.mp3": "Nomes das equipes atualizados.",
    "nao_desfazer_modo.mp3": "Não é possível desfazer após trocar o modo de jogo.",
    "historico_pronto.mp3": "Histórico pronto para compartilhar.",
    "embaralhador.mp3": "Embaralhador",
    "embaralha.mp3": "embaralha",
    "proximo_embaralhar.mp3": "Próximo a embaralhar",
    "ganhou_partida.mp3": "ganhou a partida!",
    "ganharam_partida.mp3": "ganharam a partida!",
    "modo_2_config.mp3": "Modo de 2 jogadores configurado.",
    "modo_4_config.mp3": "Modo de 4 jogadores configurado.",
    "modo_alterado_2.mp3": "Modo alterado para 2 jogadores. Configure os nomes.",
    "modo_alterado_4.mp3": "Modo alterado para 4 jogadores. Configure os nomes.",
    "jogador_1.mp3": "Jogador 1",
    "jogador_2.mp3": "Jogador 2",
    "jogador_3.mp3": "Jogador 3",
    "jogador_4.mp3": "Jogador 4",
    "equipe_nos.mp3": "Nós",
    "equipe_eles.mp3": "Eles",
    "equipe_os_pato.mp3": "Os Pato",
    "equipe_os_marreco.mp3": "Os Marreco",
    "equipe_os_freegues.mp3": "Os Freguês",
    "equipe_os_mao_de_alface.mp3": "Os Mão de Alface",
    "equipe_os_boca_aberta.mp3": "Os Boca Aberta",
    "equipe_os_treme_treme.mp3": "Os Treme-Treme",
    "equipe_os_pe_de_cana.mp3": "Os Pé de Cana",
    "equipe_os_copo_furado.mp3": "Os Copo Furado",
    "equipe_os_garganta.mp3": "Os Garganta",
    "equipe_as_patroa.mp3": "As Patroa",
    "equipe_os_cunhado.mp3": "Os Cunhado",
    "equipe_os_manja_rola.mp3": "Os Manja Rola",
    "equipe_os_queima_rosca.mp3": "Os Queima Rosca",
}

async def gerar_todos():
    for arquivo, texto in frases.items():
        print(f"Gerando {arquivo}...")
        communicate = edge_tts.Communicate(texto, "pt-BR-FranciscaNeural")
        await communicate.save(arquivo)
    print("Todos os áudios gerados!")

asyncio.run(gerar_todos())
```
