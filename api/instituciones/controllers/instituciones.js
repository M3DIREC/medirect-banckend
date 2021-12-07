"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
  async distancia(ctx) {
    let entities = await strapi.connections.default.raw(`
      select  
      instituciones.id as idInsitucion,
      insituciondirecciones.id as idDireccion,
      institucionNombre as institucion,
      direccion,
      colonia,
      ciudad,
      estado,
      latitud,
      longitud,
      codigoPostal,
      CALCULATEDISCOORDS(${ctx.params.lat}, ${ctx.params.lng}, latitud, longitud) as distancia
      from instituciones
      inner join 
      insituciondirecciones
      on instituciones.instituciondireccion = insituciondirecciones.id
      where CALCULATEDISCOORDS(${ctx.params.lat}, ${ctx.params.lng}, latitud, longitud) < ${ctx.params.km}
      ORDER BY distancia asc;
    `);

    return entities[0];
  },
};
