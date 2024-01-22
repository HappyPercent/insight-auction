import { FunctionComponent } from "react";

const PASS_CLASS_NAMES = Symbol("PassClassName");

function flat(target, depth = 1) {
  return target.reduce(function (flat, toFlatten) {
    return flat.concat(
      Array.isArray(toFlatten) && depth > 1
        ? flat(toFlatten, depth - 1)
        : toFlatten
    );
  }, []);
}

export type BemProvider = {
  (elementName?: any, ...modifiers: any[]): string;
  transparent(elementName: any): (className: any) => string;
};

export default function bem(
  blockName: string | FunctionComponent<any>
): BemProvider {
  const actualBlockName =
    typeof blockName === "function"
      ? (blockName.displayName || blockName.name)
          .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
          .toLowerCase()
      : blockName;

  function getBemClassNames(elementName = false, ...modifiers) {
    const actualModifiers: string[] = [];
    const passClassNames: string[] = [];

    for (const modifier of modifiers.filter(Boolean)) {
      if (typeof modifier === "string") {
        actualModifiers.push(modifier);
      } else if (
        Object.prototype.hasOwnProperty.call(modifier, PASS_CLASS_NAMES)
      ) {
        passClassNames.push(...modifier[PASS_CLASS_NAMES]);
      } else {
        actualModifiers.push(
          ...Object.entries(modifier)
            .filter(([_, condition]) => condition)
            .map(([modifier]) => modifier)
        );
      }
    }

    const fullElementName: string = elementName
      ? `${actualBlockName}__${elementName}`
      : actualBlockName;
    return [
      fullElementName,
      ...flat(actualModifiers).map(
        (modifier) => `${fullElementName}_${modifier}`
      ),
      ...passClassNames,
    ]
      .join(" ")
      .trim();
  }

  getBemClassNames.transparent = function getTransparentClassName(elementName) {
    return ({ className }) =>
      getBemClassNames(elementName, bem.pass(className));
  };

  return getBemClassNames;
}

bem.pass = function createPassClassName(...classNames) {
  return { [PASS_CLASS_NAMES]: classNames };
};
