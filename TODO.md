# To Do Servidor

- [x] Armar un TODO list.
- [ ] Handshake: darle a cada cliente un ID único. 
- [ ] Validar conexión con los clientes (Seguridad)
- [ ] Si un cliente se conecta y luego se desconecta debería poder segir operando como si nada (aunque cambie su socket, no cambia su ID) 
- [ ] Grabar en Redis la última cola
- [ ] En caso de que el servidor se caiga, deberia poder volvera levantarse y seguir funcionando como si nada (levantar datos de Redis)
- [ ] Retrasarse en la fila
- [ ] Montar un server SQL para persistir diversos datos
- [ ] Grabar eventos importantes en el motor SQL
- [ ] Calcular tiempos de espera medios
- [ ] Ver que accion tomar si un cliente se desconecta
