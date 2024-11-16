from telegram import Update, WebAppInfo, KeyboardButton, ReplyKeyboardMarkup
from telegram.ext import Application, CommandHandler, ContextTypes

# Токен бота
TOKEN = "7585645541:AAEyNCJP-R2OutEoIGIgmHMZ71neuEGPnPg"

# URL веб-приложения
WEBAPP_URL = "https://lazn14.github.io/WebAppTgBot/"

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Обработчик команды /start"""
    web_app = WebAppInfo(url=WEBAPP_URL)
    keyboard = [[KeyboardButton(text="Открыть веб-приложение", web_app=web_app)]]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
    
    await update.message.reply_text(
        "Привет! Нажми на кнопку ниже, чтобы открыть веб-приложение:",
        reply_markup=reply_markup
    )

async def main():
    """Запуск бота"""
    application = Application.builder().token(TOKEN).build()
    
    # Добавляем обработчик команды /start
    application.add_handler(CommandHandler("start", start))
    
    # Запускаем бота
    await application.run_polling()

if __name__ == "__main__":
    import asyncio
    asyncio.run(main()) 