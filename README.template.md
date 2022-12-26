# JUSTAOS's ODM
JUSTAOS's ODM (Object Document Mapper) is built for Deno and provides transparent persistence for JavaScript objects to MongoDB database.

Supports schemas with multi-level inheritance. Also supports interception on operations (create, read, update and delete).

[![Build](https://github.com/justaos/odm/workflows/Build/badge.svg)](https://github.com/justaos/odm/actions?workflow=Build)
[![codecov](https://codecov.io/gh/justaos/odm/branch/main/graph/badge.svg?token=OzlniGFmNp)](https://codecov.io/gh/justaos/odm)
[![GitHub license](https://img.shields.io/github/license/justaos/odm.svg)](/LICENSE)


```ts
import {ODM} from 'https://deno.land/x/justaos_odm@<%=version%>/mod.ts';
```


## Establishing database connection
```ts
<%- await include('examples/eg-1-establishing-database-connection.ts') %>
```

## Querying
```ts
<%- await include('examples/eg-5-querying-options.ts') %>
```

## Intercepting database operations
```ts
<%- await include('examples/eg-2-intercepting-database-operations.ts') %>
```

## Define custom field type
After connection established, you can define custom field type.
```ts
<%- await include('examples/eg-3-defining-custom-field-type.ts') %>
```

## Inheritance
```ts
<%- await include('examples/eg-4-inheritance.ts') %>
 ```

Check the examples >> [here](./examples) <<

## Code of Conduct
[Contributor Covenant](/CODE_OF_CONDUCT.md)
