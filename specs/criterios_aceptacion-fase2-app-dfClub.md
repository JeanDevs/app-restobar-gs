

# Criterios aceptación para fusionar APP de mi restobar donde se registran los pedidos y mi CLUB DF puntos


|CLUB DF| 

1. Quiero que enlacemos a los usuarios que se registran en el club con la APP que hago con mis pedidos. 
1.1 Se debe realizar el modelo de datos o adaptarlo para que se enlace entre el club y el app.

Atributos
- PK: #numero whatsapp
- nombre
- fecha cumpleaños
- puntos 
- puntos historicos
- puntos usados
- ItemPremio: Será el ID que luego se consumirá en el APP registro.

2. El usuario debe tener un perfil para poder hacer el conteo y consumo de sus puntos.
3. Los puntos son = 1 sol


|APP Registro|
Atributos:
- FK: debe ser el numero registrado en el club DF (tabla correspondiente) 

1. Debe agregarse un input no obligatorio al cerrar la mesa que será el número del cliente que se ha registrado. 
1.1 Dejar para una segunda fase un método de Listar los usuarios o buscarlos por este menu. 
1.2 El total del consumo de la mesa se puede agregar al usuario que se indique en el input.

2. Se debe listar ItemPremio de Club DF, los items Premio El mozo puede seleccionar 1 item y marcarlo como parte del consumo de la mesa, una vez finalizado, los puntos se descontaran de la cuenta del usuario, debe registrarse la fecha y cuantos puntos utilizó.


3. El mozo debe poder acceder a los puntos de un usuario actuales para informárselo al cliente.


**Si bien se creara el numero de wsp como id para identificar al cliente, como un cliente puede cambiar de numero, en realidad debe haber una llave primaria única.

<Criterios aceptación>

> Los criterios para  |APP Registro| y |CLUB DF| deben cumplirse para poder dar como finalizada la tarea.
> Debe priorizarse los cambios más importantes
> Algunos cambios que no sean prioridad 1, podrán hacerse en una segunda fase
> es imperativo que nada en producción de los cobros que estamos haciendo se borre, me refiero a los registros, ya que hoy estamos operando.

