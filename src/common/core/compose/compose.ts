import * as React from 'react';

type C<T> = React.ComponentType<T>;

function composeConnect<Self, I1, E = {}>(f1: (a: C<Self & I1>) => C<Self & E>): (a: C<Self & I1>) => C<Self & E>;

function composeConnect<Self, I1, I2, E = {}>(
	f1: (a: C<Self & I1>) => C<Self & E>,
	f2: (a: C<Self & I1 & I2>) => C<Self & I1>
): (a: C<Self & I1 & I2>) => C<Self & E>;

function composeConnect<Self, I1, I2, I3, E = {}>(
	f1: (a: C<Self & I1>) => C<Self & E>,
	f2: (a: C<Self & I1 & I2>) => C<Self & I1>,
	f3: (a: C<Self & I1 & I2 & I3>) => C<Self & I1 & I2>
): (a: C<Self & I1 & I2 & I3>) => C<Self & E>;

function composeConnect<Self, I1, I2, I3, I4, E = {}>(
	f1: (a: C<Self & I1>) => C<Self & E>,
	f2: (a: C<Self & I1 & I2>) => C<Self & I1>,
	f3: (a: C<Self & I1 & I2 & I3>) => C<Self & I1 & I2>,
	f4: (a: C<Self & I1 & I2 & I3 & I4>) => C<Self & I1 & I2 & I3>
): (a: C<Self & I1 & I2 & I3 & I4>) => C<Self & E>;

function composeConnect<Self, I1, I2, I3, I4, I5, E = {}>(
	f1: (a: C<Self & I1>) => C<Self & E>,
	f2: (a: C<Self & I1 & I2>) => C<Self & I1>,
	f3: (a: C<Self & I1 & I2 & I3>) => C<Self & I1 & I2>,
	f4: (a: C<Self & I1 & I2 & I3 & I4>) => C<Self & I1 & I2 & I3>,
	f5: (a: C<Self & I1 & I2 & I3 & I4 & I5>) => C<Self & I1 & I2 & I3 & I4>
): (a: C<Self & I1 & I2 & I3 & I4 & I5>) => C<Self & E>;

function composeConnect<Self, I1, I2, I3, I4, I5, I6, E = {}>(
	f1: (a: C<Self & I1>) => C<Self & E>,
	f2: (a: C<Self & I1 & I2>) => C<Self & I1>,
	f3: (a: C<Self & I1 & I2 & I3>) => C<Self & I1 & I2>,
	f4: (a: C<Self & I1 & I2 & I3 & I4>) => C<Self & I1 & I2 & I3>,
	f5: (a: C<Self & I1 & I2 & I3 & I4 & I5>) => C<Self & I1 & I2 & I3 & I4>,
	f6: (a: C<Self & I1 & I2 & I3 & I4 & I5 & I6>) => C<Self & I1 & I2 & I3 & I4 & I5>
): (a: C<Self & I1 & I2 & I3 & I4 & I5 & I6>) => C<Self & E>;

function composeConnect(...functions: Function[]): Function {
	return functions.reduceRight((prev, next) => (arg: unknown) => prev(next(arg)));
}

export default composeConnect;
